import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { checkPublicPermission } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection: collectionSlug, id } = await params;

  const isPublic = await checkPublicPermission(collectionSlug, 'findOne');
  if (!isPublic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const docRef = doc(db, collectionSlug, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection: collectionSlug, id } = await params;

  const isPublic = await checkPublicPermission(collectionSlug, 'update');
  if (!isPublic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const docRef = doc(db, collectionSlug, id);
    
    await updateDoc(docRef, {
      ...body,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id, ...body }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  const { collection: collectionSlug, id } = await params;

  const isPublic = await checkPublicPermission(collectionSlug, 'delete');
  if (!isPublic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const docRef = doc(db, collectionSlug, id);
    await deleteDoc(docRef);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}