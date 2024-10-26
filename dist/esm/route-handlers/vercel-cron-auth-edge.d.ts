import { NextRequest, NextResponse } from 'next/server.js';
export default function withVercelCronAuthEdge(callback: (req: NextRequest, res: NextResponse) => void): (req: NextRequest, res: NextResponse) => void;
