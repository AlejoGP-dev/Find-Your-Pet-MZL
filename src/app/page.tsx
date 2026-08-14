import Portada from "@/components/Portada";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function Inicio({ searchParams }: { searchParams: Params }) {
  return <Portada ciudad={null} params={await searchParams} />;
}
