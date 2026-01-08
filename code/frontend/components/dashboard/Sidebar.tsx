"use client";

import React from 'react';
import Link from 'next/link';
import { Settings, Database, Search, Code, Target, Users, FileText, Handshake, ShoppingCart } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

const tools = [
  { id: '1', name: 'Campaign Setter', route: '/campaigns', icon: Settings, roles: ['wholesaler', 'admin', 'dev'] },
  { id: '2', name: 'Dataspace', route: '/dataspace', icon: Database, roles: ['wholesaler', 'admin', 'dev'] },
  { id: '3', name: 'Sour Scrapper', route: '/scrapper', icon: Search, roles: ['wholesaler', 'admin', 'dev'] },
  { id: '4', name: 'My Spent Snippets', route: '/snippets', icon: Code, roles: ['wholesaler', 'admin', 'dev'] },
  { id: '5', name: 'Resolve Targets', route: '/targets/resolve', icon: Target, roles: ['wholesaler', 'admin', 'dev'] },
  { id: '6', name: 'Bit Fixer Targets', route: '/targets/fixer', icon: Users, roles: ['wholesaler', 'admin', 'dev'] },
  { id: '7', name: 'General Snippets', route: '/snippets/general', icon: FileText, roles: ['wholesaler', 'admin', 'dev'] },
  { id: '8', name: "Let's Make Deals", route: '/deals', icon: Handshake, roles: ['wholesaler', 'admin', 'dev'] },
  { id: '9', name: 'Buyer Profile', route: '/dashboard/buyer', icon: ShoppingCart, roles: ['buyer'] },
];

export default function Sidebar() {
  const { role } = useUserRole();

  const visibleTools = tools.filter((tool) => tool.roles.includes(role || 'wholesaler'));

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Tools</h3>
      <div className="space-y-2">
        {visibleTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.route}
              className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-[#d4af37] hover:bg-[#262626] rounded-lg transition-colors"
            >
              <Icon size={18} />
              <span className="text-sm">{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
