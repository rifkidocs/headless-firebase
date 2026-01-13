import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { checkPublicPermission } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection: collectionSlug } = await params;

  const isPublic = await checkPublicPermission(collectionSlug, 'find');
  if (!isPublic) {
    // TODO: Add proper authentication check here for non-public access
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const querySnapshot = await getDocs(collection(db, collectionSlug));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection: collectionSlug } = await params;

  const isPublic = await checkPublicPermission(collectionSlug, 'create');
  if (!isPublic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const docRef = await addDoc(collection(db, collectionSlug), {
      ...body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create data' }, { status: 500 });
  }
}
