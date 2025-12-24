
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PaymentBubble {
  id: number;
  name: string;
  amount: string;
  bank: string;
  bankLogo: string;
  badge: string;
}

const PAYMENT_DATA: PaymentBubble[] = [
  {
    id: 1,
    name: 'Devon R.',
    amount: '$452,607',
    bank: 'Bank of America',
    bankLogo: '/bank-logo-bofa.png',
    badge: 'PREMIUM MEMBER'
  },
  {
    id: 2,
    name: 'Marcus T.',
    amount: '$18,500',
    bank: 'Wells Fargo',
    bankLogo: '/bank-logo-wells-fargo.png',
    badge: 'PREMIUM MEMBER'
  },
  {
    id: 3,
    name: 'Brandon H.',
    amount: '$13,700',
    bank: 'Zelle',
    bankLogo: '/bank-logo-zelle.png',
    badge: 'VIP MEMBER'
  },
  {
    id: 4,
    name: 'Angela R.',
    amount: '$19,200',
    bank: 'Bank of America',
    bankLogo: '/bank-logo-bofa.png',
    badge: 'VIP MEMBER'
  },
  {
    id: 5,
    name: 'Tyler J.',
    amount: '$16,800',
    bank: 'Wells Fargo',
    bankLogo: '/bank-logo-wells-fargo.png',
    badge: 'PREMIUM MEMBER'
  },
  {
    id: 6,
    name: 'Natalie J.',
    amount: '$19,500',
    bank: 'Bank of America',
    bankLogo: '/bank-logo-bofa.png',
    badge: 'VIP MEMBER'
  },
  {
    id: 7,
    name: 'Christopher B.',
    amount: '$17,850',
    bank: 'Wells Fargo',
    bankLogo: '/bank-logo-wells-fargo.png',
    badge: 'VIP MEMBER'
  },
  {
    id: 8,
    name: 'Jessica C.',
    amount: '$14,200',
    bank: 'Chase Bank',
    bankLogo: '/bank-logo-chase.png',
    badge: 'MEMBER'
  }
];

export default function PaymentBubbles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative py-16 sm:py-24">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Real Members, Real Deals
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Our Passive Pilot members have made{' '}
            <span className="text-amber-400 font-bold">$750K+</span> in assignment fees
          </p>
        </div>

        {/* Payment Bubbles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PAYMENT_DATA.map((payment, index) => (
            <div
              key={payment.id}
              className="group relative"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Badge */}
              <div className="flex justify-center mb-3">
                <div className={`
                  px-4 py-1.5 rounded-full text-xs font-bold tracking-wider
                  ${payment.badge === 'PREMIUM MEMBER' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white' : 
                    payment.badge === 'VIP MEMBER' ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' : 
                    'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'}
                  shadow-lg
                `}>
                  {payment.badge}
                </div>
              </div>

              {/* Card */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-500/30">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 text-center">
                  {/* Name */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {payment.name}
                  </h3>

                  {/* Bank Logo Circle */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center shadow-lg overflow-hidden">
                      <Image
                        src={payment.bankLogo}
                        alt={`${payment.bank} logo`}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Bank Name */}
                  <p className="text-sm text-gray-400 mb-2">
                    {payment.bank}
                  </p>

                  {/* Received Text */}
                  <p className="text-xs text-gray-500 mb-3 font-medium">
                    Received
                  </p>

                  {/* Amount */}
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                    {payment.amount}
                  </div>

                  {/* Label */}
                  <p className="text-xs text-gray-500 mt-3 uppercase tracking-wider">
                    Passive Pilot Member
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            ✅ <span className="text-amber-400 font-semibold">450+ active members</span> using our AI tools
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Updated daily with new member wins</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
