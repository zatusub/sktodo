// todo-mojibake.tsx

/** 文字化けに使用するランダムな記号のセット */
const MOJIBAKE_CHARS = '†‡§¶•¢£¤¥¦§¨©ª«®¯°±²³´µ¶·¸¹º»¼½¾¿€ÆÇÐÑÞßæçðñþ£¥€¿¡™©®¢µ¶•';

/**
 * 指定された文字列を文字化けさせる関数。
 * @param originalText 元のTodoのタイトル
 * @returns 文字化け後の文字列
 */
export const createMojibakeText = (originalText: string): string => {
  if (!originalText || originalText.length === 0) {
    return '??????????';
  }
  
  const length = originalText.length;
  let mojibake = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * MOJIBAKE_CHARS.length);
    mojibake += MOJIBAKE_CHARS[randomIndex];
  }
  
  return mojibake;
};