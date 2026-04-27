export default function handler(req: any, res: any) {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Minimal function works',
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      node_version: process.version
    }
  });
}
