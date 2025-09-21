/// pb_hooks/likes_count.pb.js
/// post_likes 생성/삭제 후 해당 post의 likesCount를 재계산해 post에 저장
onRecordAfterCreateRequest("post_likes", async (e) => {
    try {
        const postId = e.record.get("post");
        if (!postId) return;

        const likesCount = await countLikesForPost(postId);
        await updatePostLikesCount(postId, likesCount);
    } catch (err) {
        console.log("[likes] after create failed:", err);
    }
});

onRecordAfterDeleteRequest("post_likes", async (e) => {
    try {
        const postId = e.record.get("post");
        if (!postId) return;

        const likesCount = await countLikesForPost(postId);
        await updatePostLikesCount(postId, likesCount);
    } catch (err) {
        console.log("[likes] after delete failed:", err);
    }
});

async function countLikesForPost(postId) {
    // totalItems 이용(빠르고 간단)
    const list = await $app.dao().listRecords("post_likes", 1, 1, {
        filter: `post = "${postId}"`
    });
    return list.totalItems || 0;
}

async function updatePostLikesCount(postId, likesCount) {
    const rec = await $app.dao().findRecordById("post", postId);
    rec.set("likesCount", likesCount);
    await $app.dao().saveRecord(rec);
}
