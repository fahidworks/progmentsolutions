import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMe } from "@/lib/hr.functions";

export function useMe() {
  const fn = useServerFn(getMe);
  return useQuery({ queryKey: ["hr", "me"], queryFn: () => fn(), staleTime: 60_000 });
}
