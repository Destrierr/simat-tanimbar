import { http } from "./http";

export async function getActivityLogsService(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  const { data: body } = await http.get("/activity-logs", {
    params: { page: 1, per_page: 10, ...cleaned },
  });

  return { data: body.data || [], meta: body.meta || {} };
}