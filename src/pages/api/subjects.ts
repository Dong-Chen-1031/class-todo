import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  const NOTION_TOKEN = import.meta.env.NOTION_TOKEN;
  const NOTION_DATABASE_ID = import.meta.env.NOTION_DATABASE_ID;

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return new Response(
      JSON.stringify({ error: "Missing Notion Token or Database ID" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2025-09-03",
        },
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Notion API Error in subjects:", errText);
      throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();

    const options: string[] =
      data.properties?.["科目"]?.select?.options?.map(
        (opt: { name: string }) => opt.name,
      ) ?? [];

    return new Response(JSON.stringify({ subjects: options }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, max-age=3600",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
