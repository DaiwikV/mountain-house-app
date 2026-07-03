import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { amount } = await req.json()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Support Mountain House Assistant',
            description: 'Help keep this community tool free and running!',
          },
          unit_amount: amount * 100, // convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `https://mountain-house-app-3dtt.vercel.app/donate?success=true`,
    cancel_url: `https://mountain-house-app-3dtt.vercel.app/donate?canceled=true`,
  })

  return NextResponse.json({ url: session.url })
}