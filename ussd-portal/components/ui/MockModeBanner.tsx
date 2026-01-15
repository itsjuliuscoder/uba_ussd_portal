// components/ui/MockModeBanner.tsx
import { getMockMode } from "@/lib/mocks/config";

export function MockModeBanner() {
  if (typeof window !== "undefined" && getMockMode() !== "off") {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: '#f59e42',
        color: '#222',
        textAlign: 'center',
        padding: '6px 0',
        fontWeight: 600,
        zIndex: 9999,
        letterSpacing: 1,
      }}>
        MOCK MODE ACTIVE ({getMockMode().toUpperCase()}) — All data is fake
      </div>
    );
  }
  return null;
}
