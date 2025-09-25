/// pb_migrations/1726800000_create_post_likes.js
migrate((db) => {
    const dao = new Dao(db);

    // post_likes 컬렉션 생성
    const collection = new Collection({
        id: "post_likes",
        name: "post_likes",
        type: "base",
        system: false,
        schema: [
            new SchemaField({
                id: "post",
                name: "post",
                type: "relation",
                required: true,
                unique: false,
                options: {
                    collectionId: "post",   // ← 프로젝트의 post 컬렉션 ID/이름 사용
                    cascadeDelete: true,
                    maxSelect: 1
                }
            }),
            new SchemaField({
                id: "user",
                name: "user",
                type: "relation",
                required: true,
                unique: false,
                options: {
                    collectionId: "_pb_users_auth_", // 기본 users
                    cascadeDelete: true,
                    maxSelect: 1
                }
            }),
        ],
        indexes: [
            // 같은 유저가 같은 게시물 중복 좋아요 방지
            "CREATE UNIQUE INDEX post_likes_unique ON post_likes (post, user)"
        ],
        options: {}
    });

    dao.saveCollection(collection);
}, (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("post_likes");
    if (collection) dao.deleteCollection(collection);
});
