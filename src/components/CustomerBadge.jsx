/**
 * CustomerBadge
 * Detects if visitor is a "returning customer" based on a localStorage flag
 * set after a successful order. No personal data is collected.
 */
import { useEffect, useState } from 'react';
import { UserCheck, UserPlus } from 'lucide-react';

const RETURNING_KEY = 'snap_has_ordered';

export function markAsReturningCustomer() {
  localStorage.setItem(RETURNING_KEY, '1');
}

export default function CustomerBadge() {
  const [returning, setReturning] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setReturning(localStorage.getItem(RETURNING_KEY) === '1');
    const fadeTimer = setTimeout(() => setVisible(false), 4500);
    const unmountTimer = setTimeout(() => setMounted(false), 5000);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className={`customer-badge ${returning ? 'returning' : 'new'}`}
      style={{ 
        opacity: visible ? 1 : 0, 
        transition: 'opacity 0.5s ease-out',
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      {returning ? (
        <>
          <UserCheck size={14} />
          <span>Welcome back, returning customer! 🎉</span>
        </>
      ) : (
        <>
          <UserPlus size={14} />
          <span>New Customer</span>
        </>
      )}
    </div>
  );
}
