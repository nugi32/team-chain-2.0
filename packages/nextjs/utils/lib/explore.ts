import { useEffect, useState } from "react";
import { useDashboardUserData } from "@/utils/lib/dashboard/useDashboardUserData";
import { CompleteTaskOutput, useGetCompleteTasks } from "@/utils/lib/tasksHelper/useGetCompleteTasks";

export function useExplore() {
  const [exploreTasks, setExploreTasks] = useState<any[]>([]);

  return {};
}
