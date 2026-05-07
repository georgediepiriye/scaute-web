// @/components/create-event/FormElements.tsx
import { motion } from "framer-motion";

// BRAND COLOR CONSTANTS
const KIVO_BLUE = "#0052FF"; // Primary Action Color
const KIVO_YELLOW = "#FFD700"; // Energy & Accent

export const StepHeader = ({
  step,
  totalSteps,
  title,
}: {
  step: number;
  totalSteps: number;
  title: string;
}) => (
  <div className="mb-8 md:mb-12 flex justify-between items-end">
    <div>
      <p
        className="text-[10px] font-black uppercase tracking-widest"
        style={{ color: KIVO_BLUE }}
      >
        Step {step} of {totalSteps}
      </p>
      <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-gray-900">
        {title}
      </h1>
    </div>
    <div className="h-1.5 w-24 md:w-32 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(step / totalSteps) * 100}%` }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="h-full"
        style={{ backgroundColor: KIVO_BLUE }}
      />
    </div>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InputGroup = ({ label, children, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1.5 tracking-wider">
      {Icon && <Icon size={12} style={{ color: KIVO_BLUE }} />} {label}
    </label>
    <div className="relative group">
      {children}
      {/* Optional: Subtle yellow focus indicator line could be added here if desired */}
    </div>
  </div>
);
