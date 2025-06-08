const { ImageResponse } = require('@vercel/og');

module.exports.config = {
  runtime: 'edge',
};

module.exports.default = function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Digital Modenhet';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
