import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
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
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const subject = url.searchParams.get("subject");

    const tzOffset = 8 * 60 * 60 * 1000;
    const todayStr = new Date(Date.now() + tzOffset)
      .toISOString()
      .split("T")[0];

    const dateFilters: any[] = [
      {
        property: "截止日期",
        date: {
          before: todayStr,
        },
      },
      {
        property: "截止日期",
        date: {
          on_or_after: "2026-02-25",
        },
      },
    ];

    if (subject) {
      dateFilters.push({
        property: "科目",
        select: {
          equals: subject,
        },
      });
    }

    // Notion query payload
    const notionReqBody: any = {
      page_size: 10,
      filter: {
        and: dateFilters,
      },
      sorts: [{ property: "截止日期", direction: "descending" }],
    };

    if (cursor) {
      notionReqBody.start_cursor = cursor;
    }

    const res = await fetch(
      `https://api.notion.com/v1/data_sources/${NOTION_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2025-09-03",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notionReqBody),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Notion API Error in history:", errText);
      throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();

    const homeworks = data.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        name: props["作業名稱"]?.title?.[0]?.plain_text || "無名稱",
        subject: props["科目"]?.select?.name || "無科目",
        deadline: props["截止日期"]?.date?.start || new Date().toISOString(),
      };
    });

    return new Response(
      JSON.stringify({
        homeworks,
        next_cursor: data.next_cursor,
        has_more: data.has_more,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Add Edge Cache headers for history (since history doesn't change often)
          "Cache-Control": "public, s-maxage=300, max-age=300",
        },
      },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
