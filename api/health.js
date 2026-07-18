module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: !!process.env.ANTHROPIC_API_KEY });
};
