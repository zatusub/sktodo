// todo-mojibake.tsx

/** 文字化けに使用するランダムな記号のセット */
const MOJIBAKE_CHARS = '†‡§¶•¢£¤¥¦§¨©ª«®¯°±²³´µ¶·¸¹º»¼½¾¿€ÆÇÐÑÞßæçðñþ£¥€¿¡™©®¢µ¶•';
const MOJIBAKE_COUNT = 3; // ★文字化けさせる文字数

/**
 * 指定された文字列を文字化けさせる関数（段階的）
 * @param originalText 元のTodoのタイトル (is_disguised: true の場合は original_title を使用)
 * @param currentDisguisedText 現在の文字化け済みのタイトル (titleカラムの値)
 * @param disruptionCount 現在までに適用された妨害の回数 (1, 2, 3...)
 * @returns MojibakeResult
 */
export interface MojibakeResult {
  originalText: string;
  disguisedText: string;
}

/**
 * 指定された文字列をランダムに3文字だけ文字化けさせる関数。
 * @param originalText 元のTodoのタイトル
 * @returns MojibakeResult (元のテキストと文字化け後のテキスト)
 */
export const createMojibakeText = (
    originalText: string,
    currentDisguisedText: string,
    disruptionCount: number
): MojibakeResult => {
    if (!originalText || originalText.length === 0 || disruptionCount >= 3) {
        // 3回以上の妨害はすべて文字化け
        return { 
            originalText: originalText, 
            disguisedText: '??????????' // または全文字MOJIBAKE_CHARS
        };
    }

    const length = originalText.length;
    // 1回の妨害で文字化けさせる文字数 (例: 33% 程度)
    // 1回目: 33%, 2回目: 66%, 3回目: 100%
    const TARGET_MOJIBAKE_PERCENT = 0.33; 
    
    // 現在の回数 * 割合 で、最終的に文字化けさせるべき総文字数を計算
    const totalTargetMojibake = Math.min(
        length, 
        Math.ceil(length * TARGET_MOJIBAKE_PERCENT * disruptionCount)
    );

    // 既に文字化けしている文字数 (現状のtitleから判断)
    let alreadyMojibakeCount = 0;
    const currentChars = currentDisguisedText.split('');
    
    // 既に文字化け記号が使われている場所を追跡
    const mojibakeIndices = new Set<number>();

    for (let i = 0; i < length; i++) {
        // 現在の文字がMOJIBAKE_CHARSに含まれている、または前回文字化けで置き換えた記号なら、既に文字化け済みと見なす
        if (MOJIBAKE_CHARS.includes(currentChars[i])) { 
            mojibakeIndices.add(i);
            alreadyMojibakeCount++;
        }
    }
    
    // 今回新たに文字化けさせる必要のある文字数
    const needToDisguise = Math.max(0, totalTargetMojibake - alreadyMojibakeCount);

    const disguisedChars = [...currentChars]; // 現在の文字化け状態からスタート
    const availableIndices: number[] = [];

    // まだ文字化けされていないインデックスを抽出
    for (let i = 0; i < length; i++) {
        if (!mojibakeIndices.has(i)) {
            availableIndices.push(i);
        }
    }

    // 4. 新たに文字化けさせるインデックスをランダムに選択
    for (let i = 0; i < needToDisguise; i++) {
        if (availableIndices.length === 0) break;

        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const targetIndex = availableIndices.splice(randomIndex, 1)[0]; // 選んだインデックスをリストから削除

        // 文字化け記号に置き換える
        const randomMojibakeIndex = Math.floor(Math.random() * MOJIBAKE_CHARS.length);
        disguisedChars[targetIndex] = MOJIBAKE_CHARS[randomMojibakeIndex];
    }
    
    // 5. 結果を MojibakeResult 型で返す
    return {
        originalText: originalText, 
        disguisedText: disguisedChars.join('')
    };
};