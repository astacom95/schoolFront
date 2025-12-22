export async function GET() {
  // Placeholder API route to verify the app is up in dev environments.
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
