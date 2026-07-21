import { NextResponse } from "next/server";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { ensureTablesExist } from "@/db/migrate";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  await ensureTablesExist();
  try {
    const list = await db.select().from(reservations).orderBy(desc(reservations.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureTablesExist();
  try {
    const body = await request.json();

    if (!body.guestName || !body.phone || !body.date || !body.time || !body.partySize) {
      return NextResponse.json({ error: "Missing required reservation details" }, { status: 400 });
    }

    const reservationNumber = `FANA-RES-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRes = await db
      .insert(reservations)
      .values({
        reservationNumber,
        guestName: body.guestName,
        phone: body.phone,
        email: body.email || "",
        date: body.date,
        time: body.time,
        partySize: Number(body.partySize),
        tablePreference: body.tablePreference || "Indoor Dining",
        specialRequests: body.specialRequests || "",
        status: "confirmed",
      })
      .returning();

    return NextResponse.json(newRes[0]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await ensureTablesExist();
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Reservation ID required" }, { status: 400 });
    }

    const updated = await db
      .update(reservations)
      .set({
        status: body.status,
        tablePreference: body.tablePreference,
        date: body.date,
        time: body.time,
        partySize: body.partySize ? Number(body.partySize) : undefined,
        specialRequests: body.specialRequests,
      })
      .where(eq(reservations.id, body.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await ensureTablesExist();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    await db.delete(reservations).where(eq(reservations.id, Number(id)));
    return NextResponse.json({ success: true, id: Number(id) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
