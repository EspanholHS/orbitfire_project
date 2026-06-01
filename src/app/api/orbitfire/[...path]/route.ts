import { ORBITFIRE_API_BASE_URL } from "@/services/orbitfire-api";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const requestUrl = new URL(request.url);
  const upstream = new URL(`/v1/${path.slice(1).join("/")}`, ORBITFIRE_API_BASE_URL);
  requestUrl.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));

  try {
    const response = await fetch(upstream.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
    });

    const body = await response.text();
    return new Response(body, {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
      status: response.status,
    });
  } catch {
    return Response.json(
      { message: "OrbitFire API proxy failed" },
      { status: 502 },
    );
  }
}
