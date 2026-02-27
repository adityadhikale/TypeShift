function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;

  // Remove silent e at the end (but not "le" endings like "candle")
  word = word.replace(/(?:[^laeiouy]e)$/, '');

  // Remove common silent suffixes that don't add syllables
  word = word.replace(/(?:[^laeiouy]es)$/, '');

  // Handle -ed: only silent when preceded by t or d it's voiced, otherwise silent
  word = word.replace(/(?<=[^dt])ed$/, '');

  // Remove leading y (not a vowel in initial position)
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

// Check if a word is complex for Gunning Fog (3+ syllables, excluding common inflections)
function isComplexWord(word: string): boolean {
  const syllables = countSyllables(word);
  if (syllables < 3) return false;

  const lower = word.toLowerCase();

  // Strip common suffixes and recount - if base word has < 3 syllables, not complex
  const stripped = lower
    .replace(/(ing|ed|es|er|ly|ment|ness|tion|sion|ous|ive|able|ible)$/, '');

  if (stripped !== lower) {
    const baseSyllables = countSyllables(stripped);
    if (baseSyllables < 3) return false;
  }

  return true;
}

self.onmessage = (e: MessageEvent<string>) => {
  const text = e.data;
  const trimmed = text.trim();

  if (!trimmed) {
    self.postMessage({
      wordCount: 0,
      sentenceCount: 0,
      totalSyllables: 0,
      averageWordLength: "0",
      averageSentenceLength: "0 words",
      gunningFogIndex: "0.0",
      lineCount: 0,
      readingTime: "0 min",
      paragraphCount: 0,
      uniqueWordCount: 0,
      speakingTime: "0 min",
    });
    return;
  }

  const words = trimmed.split(/\s+/).filter((w: string) => w.length > 0);
  const wordCount = words.length;
  const sentenceCount = trimmed.split(/[.!?]+/).filter((s: string) => s.trim().length > 0).length;
  const totalSyllables = words.reduce((total: number, word: string) => total + countSyllables(word), 0);
  const lineCount = text.split('\n').filter((line: string) => line.trim() !== '').length;

  const totalLetterLength = words.reduce((sum: number, word: string) => sum + word.replace(/[^a-zA-Z]/g, '').length, 0);
  const averageWordLength = (totalLetterLength / wordCount).toFixed(2);

  const averageSentenceLength = sentenceCount === 0
    ? "0 words"
    : `${(wordCount / sentenceCount).toFixed(2)} words`;

  let gunningFogIndex = "0.0";
  if (sentenceCount > 0 && wordCount > 0) {
    const complexWords = words.filter((word: string) => isComplexWord(word)).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    const percentComplexWords = (complexWords / wordCount) * 100;
    gunningFogIndex = (0.4 * (avgWordsPerSentence + percentComplexWords)).toFixed(1);
  }

  // Reading time: average 200 words per minute
  const readMinutes = Math.ceil(wordCount / 200);
  const readingTime = readMinutes <= 1 ? "< 1 min" : `${readMinutes} min`;

  // Speaking time: average 130 words per minute
  const speakMinutes = Math.ceil(wordCount / 130);
  const speakingTime = speakMinutes <= 1 ? "< 1 min" : `${speakMinutes} min`;

  // Paragraph count: blocks separated by one or more blank lines
  const paragraphCount = trimmed.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0).length;

  // Unique word count
  const uniqueWords = new Set(words.map((w: string) => w.toLowerCase().replace(/[^a-zA-Z']/g, '')).filter((w: string) => w.length > 0));
  const uniqueWordCount = uniqueWords.size;

  self.postMessage({
    wordCount,
    sentenceCount,
    totalSyllables,
    averageWordLength,
    averageSentenceLength,
    gunningFogIndex,
    lineCount,
    readingTime,
    paragraphCount,
    uniqueWordCount,
    speakingTime,
  });
};
