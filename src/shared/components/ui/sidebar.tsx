"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
className,
children,
...props
}: React.ComponentProps<typeof motion.div>) => {
const { open, setOpen, animate } = useSidebar();
return (
<>
<motion.div
className={cn(
"h-full px-4 py-4 hidden md:flex md:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-[300px] shrink-0 shadow-executive",
className
)}
animate={{
width: animate ? (open ? "300px" : "60px") : "300px",
}}
onMouseEnter={() => setOpen(true)}
onMouseLeave={() => setOpen(false)}
{...props}
>
{children}
</motion.div>
</>
);
};

export const MobileSidebar = ({
className,
children,
...props
}: React.ComponentProps<"div">) => {
const { open, setOpen } = useSidebar();
return (
<>
<div
className={cn(
"h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-muted border-b border-border w-full"
)}
{...props}
>
<div className="flex justify-end z-20 w-full">
<IconMenu2
className="text-foreground hover:text-brand-primary transition-colors"
onClick={() => setOpen(!open)}
/>
</div>
<AnimatePresence>
{open && (
<motion.div
initial={{ x: "-100%", opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
exit={{ x: "-100%", opacity: 0 }}
transition={{
duration: 0.3,
ease: "easeInOut",
}}
className={cn(
"fixed h-full w-full inset-0 bg-background/95 backdrop-blur-xl p-10 z-100 flex flex-col justify-between shadow-2xl",
className
)}
>
<div
className="absolute right-10 top-10 z-50 text-foreground hover:text-brand-primary transition-colors"
onClick={() => setOpen(!open)}
>
<IconX />
</div>
{children}
</motion.div>
)}
</AnimatePresence>
</div>
</>
);
};

export const SidebarLink = ({
link,
className,
...props
}: {
link: Links;
className?: string;
}) => {
const { open, animate } = useSidebar();
return (
<a
href={link.href}
className={cn(
"flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm",
className
)}
{...props}
>
<div className="text-sidebar-foreground group-hover/sidebar:text-sidebar-accent-foreground transition-colors duration-200">
        {link.icon}
</div>

<motion.span
animate={{
  display: animate ? (open ? "inline-block" : "none") : "inline-block",
  opacity: animate ? (open ? 1 : 0) : 1,
  }}
className="text-sidebar-foreground group-hover/sidebar:text-sidebar-accent-foreground text-sm transition-all duration-200 whitespace-pre inline-block p-0 m-0 group-hover/sidebar:translate-x-1"
>
    {link.label}
    </motion.span>
    </a>
  );
};
