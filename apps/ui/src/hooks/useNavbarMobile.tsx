"use client"

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"

type NavbarMobileContextValue = [boolean, Dispatch<SetStateAction<boolean>>]

const NavbarMobileContext = createContext<NavbarMobileContextValue | null>(null)

export function NavbarMobileProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <NavbarMobileContext.Provider
      // React Compiler handles this memoization; keeping this explicit avoids
      // unnecessary useMemo noise around a tiny UI state provider.
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={[mobileOpen, setMobileOpen]}
    >
      {children}
    </NavbarMobileContext.Provider>
  )
}

export function useNavbarMobile() {
  const context = useContext(NavbarMobileContext)

  if (context == null) {
    throw new Error("Navbar mobile controls must be used inside provider")
  }

  return context
}
