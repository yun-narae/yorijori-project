// 현재 로그인 user와 post 작성자가 동일한지
export const editorIdOf = (p) => {
    if (!p) return null;

    const ed = p.editor;
    if (typeof ed === "string") return ed;
    if (ed && typeof ed === "object" && ed.id) return ed.id;
    if (Array.isArray(ed)) {
        const found = ed.find((e) =>
            typeof e === "string" || (e && typeof e === "object" && e.id)
        );
        return typeof found === "string" ? found : found?.id ?? null;
    }

    const ex = p?.expand?.editor;
    if (typeof ex === "string") return ex;
    if (ex && typeof ex === "object" && ex.id) return ex.id;
    if (Array.isArray(ex)) {
        const u = ex.find((e) => e && e.id);
        return u?.id ?? null;
    }

    return null;
};

export const isOwnerOf = (p, uid) =>
    String(uid ?? "") === String(editorIdOf(p) ?? "");

export const iconNameOf = (p, uid) =>
    isOwnerOf(p, uid) ? "kebabMenu" : "heart-1";
