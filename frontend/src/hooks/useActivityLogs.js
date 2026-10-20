import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getActivityLogsService } from "../services/activity_logs";

export function useActivityLogs(params, options = {}) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => getActivityLogsService(params),
    placeholderData: keepPreviousData, // v4: keepPreviousData: true
    ...options,
  });
}