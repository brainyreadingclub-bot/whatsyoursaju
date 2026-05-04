/**
 * /api/og-gunghap.js — 궁합 딥링크 OG 메타 렌더러
 *
 * URL: /share/gunghap?d=BASE64_ENCODED_DATA
 * - 크롤러 (카카오톡, Facebook 등): OG 메타 태그가 포함된 HTML 반환
 * - 사람: JS redirect → /?gunghap=ENCODED (index.html에서 딥링크 처리)
 *
 * 결과값이 URL에 이미 포함되어 있으므로 서버 계산 불필요.
 */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

module.exports = (req, res) => {
  const { d } = req.query;

  // d 파라미터 없거나 빈 경우 → 홈으로 redirect
  if (!d) {
    res.writeHead(302, { Location: 'https://www.whatsyoursaju.com' });
    res.end();
    return;
  }

  let data;
  try {
    const json = decodeURIComponent(escape(Buffer.from(d, 'base64').toString('binary')));
    data = JSON.parse(json);
  } catch {
    res.writeHead(302, { Location: 'https://www.whatsyoursaju.com' });
    res.end();
    return;
  }

  // 필수 필드 검증
  const { mn, pn, s, g, gi, c } = data;
  if (!mn || !pn || s === undefined || !g || !c) {
    res.writeHead(302, { Location: 'https://www.whatsyoursaju.com' });
    res.end();
    return;
  }

  const title = escapeHtml(`${mn} ♥ ${pn} 궁합 ${s}점! ${gi || ''} ${g}`);
  const description = escapeHtml(c);
  const ogUrl = `https://www.whatsyoursaju.com/share/gunghap?d=${encodeURIComponent(d)}`;
  const redirectUrl = `https://www.whatsyoursaju.com/?gunghap=${encodeURIComponent(d)}`;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="https://www.whatsyoursaju.com/og-image.png">
  <meta property="og:url" content="${escapeHtml(ogUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="SAJU">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="https://www.whatsyoursaju.com/og-image.png">
  <script>window.location.replace("${redirectUrl.replace(/"/g, '\\"')}");</script>
</head>
<body>
  <noscript>
    <p><a href="${escapeHtml(redirectUrl)}">궁합 결과 보러가기 &rarr;</a></p>
  </noscript>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=604800');
  res.status(200).send(html);
};
