/// 게시물이 삭제되면 연결된 post_likes도 강제로 제거
onRecordAfterDeleteRequest("post", async (e) => {
    try {
        const postId = e?.record?.id;
        if (!postId) return;

        // 여러 페이지에 나뉠 수 있으므로 루프 처리
        let page = 1;
        while (true) {
            const list = await $app.dao().listRecords("post_likes", page, 200, {
                filter: `post = "${postId}"`,
            });
            for (const rec of (list?.items || [])) {
                await $app.dao().deleteRecord(rec);
            }
            if (!list?.items?.length) break;
            page++;
        }
    } catch (err) {
        console.log("[cascade_likes] cleanup failed:", err);
    }
});
