import amphtmlValidator from 'amphtml-validator';

const DEFAULT_URL = 'http://localhost:3000/web-stories';

const getTargetUrl = () => {
  const urlArg = process.argv[2];
  if (!urlArg) {
    console.error('Provide an AMP URL. Example: npm run validate:amp -- http://localhost:3000/web-stories/story-slug/amp');
    process.exit(1);
  }

  return urlArg.startsWith('http://') || urlArg.startsWith('https://')
    ? urlArg
    : `${DEFAULT_URL}/${urlArg.replace(/^\/+/, '')}`;
};

const run = async () => {
  const url = getTargetUrl();
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Failed to fetch URL (${response.status}): ${url}`);
    process.exit(1);
  }

  const html = await response.text();
  const validator = await amphtmlValidator.getInstance();
  const result = validator.validateString(html);

  if (result.status === 'PASS') {
    console.log(`AMP PASS: ${url}`);
    process.exit(0);
  }

  console.error(`AMP FAIL: ${url}`);
  for (const error of result.errors) {
    const location = error.line > 0 ? `${error.line}:${error.col}` : 'n/a';
    console.error(`- [${error.severity}] ${location} ${error.message}`);
  }
  process.exit(1);
};

run().catch((error) => {
  console.error('AMP validation error:', error?.message || error);
  process.exit(1);
});
