// Supabase Edge Function: 일일 퀴즈 Push 알림 발송
// 배포: Supabase 대시보드 > Edge Functions > 새 함수 > 이 코드 붙여넣기
// 예약: Supabase SQL Editor에서 pg_cron 설정 (아래 주석 참조)

// pg_cron 설정 예시 (Supabase SQL Editor에서 실행):
// select cron.schedule(
//   'send-daily-notifications',
//   '* * * * *',
//   $$
//   select net.http_post(
//     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notifications',
//     headers := '{"Authorization": "Bearer YOUR_ANON_KEY", "Content-Type": "application/json"}'::jsonb,
//     body := '{}'::jsonb
//   );
//   $$
// );

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

Deno.serve(async () => {
  try {
    webpush.setVapidDetails(
      `mailto:${Deno.env.get("VAPID_CONTACT_EMAIL") ?? "admin@devrank.app"}`,
      Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
      Deno.env.get("VAPID_PRIVATE_KEY") ?? ""
    );

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // KST(UTC+9) 기준 현재 시간 계산
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const hh = String(kstNow.getUTCHours()).padStart(2, "0");
    const mm = String(kstNow.getUTCMinutes()).padStart(2, "0");
    const currentTime = `${hh}:${mm}:00`;

    // 현재 시간에 알림을 보내야 하는 사용자 조회
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, push_subscription")
      .eq("notification_enabled", true)
      .eq("notification_time", currentTime)
      .not("push_subscription", "is", null);

    if (error) throw error;

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ sent: 0, time: currentTime }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const expiredIds: string[] = [];
    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          await webpush.sendNotification(
            user.push_subscription,
            JSON.stringify({
              title: "DevRank 🎯",
              body: `${user.name}님, 오늘의 퀴즈를 풀 시간입니다!`,
              icon: "/icons/icon-192.png",
              url: "/",
            })
          );
        } catch (err: unknown) {
          // 만료된 구독 정리 (410 Gone)
          if (
            err &&
            typeof err === "object" &&
            "statusCode" in err &&
            (err as { statusCode: number }).statusCode === 410
          ) {
            expiredIds.push(user.id);
          }
          throw err;
        }
      })
    );

    // 만료된 구독 DB에서 제거
    if (expiredIds.length > 0) {
      await supabase.from("users").update({ push_subscription: null }).in("id", expiredIds);
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return new Response(JSON.stringify({ sent, time: currentTime }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
