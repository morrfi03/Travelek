export function norm(s) {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}
export function nameHas(hay, needle) {
    if (!needle || !hay)
        return false;
    if (hay === needle)
        return true;
    let i = 0;
    let j = 0;
    let before = false;
    let after = false;
    while ((j = hay.indexOf(needle, i)) >= 0) {
        before = j === 0 || /[\s\-(/]/.test(hay.charAt(j - 1));
        after = j + needle.length >= hay.length || /[\s\-)/,]/.test(hay.charAt(j + needle.length));
        if (before && after)
            return true;
        i = j + 1;
    }
    return false;
}
