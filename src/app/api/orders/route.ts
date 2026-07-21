import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ensureTablesExist } from "@/db/migrate";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  await ensureTablesExist();
  try {
    const list = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureTablesExist();
  try {
    const body = await request.json();

    if (!body.customerName || !body.phone || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Customer details and items required" }, { status: 400 });
    }

    const orderNumber = `FANA-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrd = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName: body.customerName,
        phone: body.phone,
        orderType: body.orderType || "delivery",
        address: body.orderType === "delivery" ? (body.address || "Delivery") : "Pick up / Dine-In at Cafe",
        items: JSON.stringify(body.items),
        totalAmount: Number(body.totalAmount),
        status: "pending",
        notes: body.notes || "",
      })
      .returning();

    return NextResponse.json(newOrd[0]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await ensureTablesExist();
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const updated = await db
      .update(orders)
      .set({
        status: body.status,
        notes: body.notes,
      })
      .where(eq(orders.id, body.id))
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
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }
    await db.delete(orders).where(eq(orders.id, Number(id)));
    return NextResponse.json({ success: true, id: Number(id) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
