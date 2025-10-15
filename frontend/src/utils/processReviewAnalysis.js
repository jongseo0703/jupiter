/**
 * 키워드 비율 계산 클래스
 * @param {*} analysisData 
 * @returns 
 */
export const processReviewAnalysis = (analysisData) => {
    //데이터가 없으면 빈 배열 반환
    if (!analysisData) return [];

    const categories = [];

    //카테고리 개수 만큼 반복문
    Object.keys(analysisData).forEach(categoryName => {
        //키워드랑 점수를 저장
        const keywords = analysisData[categoryName];

    // 모든 키워드의 점수들 합산
    const totalScore = Object.values(keywords).reduce((sum, score) => sum + score, 0);

    // 0이면 반환
    if (totalScore === 0) return;

    // 키워드랑 점수를 내림차순으로 정렬
    const sortedKeywords = Object.entries(keywords)
      .map(([keyword, score]) => ({ keyword, score }))
      .sort((a, b) => b.score - a.score);

    //0이 아닌 상위 1개만 추출
    const topKeywords = sortedKeywords
      .filter(item => item.score > 0)
      .slice(0, 1)
      .map(item => ({
        keyword: item.keyword,
        score: item.score,
        percentage: totalScore > 0 ? Math.round((item.score / totalScore) * 100) : 0
      }));

    // 카테고리 있으면 저장
    if (topKeywords.length > 0) {
      categories.push({
        categoryName,
        totalScore,
        topKeywords,
        keywords
      });
    }
  });

  return categories;
};
