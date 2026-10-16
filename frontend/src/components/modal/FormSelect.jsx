import Select, { components } from "react-select";
import { Icon } from "@iconify/react";

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <Icon icon="lucide:chevron-down" className="w-4 h-4 text-slate-500" />
  </components.DropdownIndicator>
);

const MultiValue = (props) => {
  const values = props.getValue();
  if (props.index >= 2) {
    if (props.index === 2) {
      return (
        <div
          className="ml-2 text-sm text-gray-500 cursor-pointer"
          title={values.map((v) => v.label).join(", ")}
        >
          +{values.length - 2} more
        </div>
      );
    }
    return null;
  }
  return <components.MultiValue {...props} />;
};

const getCustomStyles = (isDark) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",
    borderRadius: "8px",
    borderColor: isDark ? "#475569" : "#CBD5E1",
    backgroundColor: isDark ? "#1E293B" : "white",
    boxShadow: state.isFocused ? "0 0 0 2px #38BDF8" : "none",
    paddingLeft: "8px",
    "&:hover": { borderColor: isDark ? "#475569" : "#CBD5E1" },
  }),
  valueContainer: (provided) => ({
    ...provided,
    maxHeight: "70px",
    overflowY: "auto",
    flexWrap: "wrap",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: isDark ? "#64748B" : "#94A3B8",
    fontSize: "14px",
  }),
  input: (provided) => ({
    ...provided,
    color: isDark ? "#E2E8F0" : "#0F172A",
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "14px",
    color: isDark ? "#E2E8F0" : "#0F172A",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: isDark ? "#334155" : "#E2E8F0",
    borderRadius: "8px",
    padding: "2px 4px",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    fontSize: "12px",
    color: isDark ? "#E2E8F0" : "#0F172A",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: isDark ? "#94A3B8" : "#64748B",
    "&:hover": {
      backgroundColor: isDark ? "#475569" : "#CBD5E1",
      color: isDark ? "white" : "black",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.75rem",
    overflow: "hidden",
    zIndex: 9999,
    backgroundColor: isDark ? "#1E293B" : "white",
    border: isDark ? "1px solid #334155" : "none",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#38BDF8"
      : state.isFocused
        ? isDark
          ? "#334155"
          : "#E0F2FE"
        : isDark
          ? "#1E293B"
          : "white",
    color: state.isSelected ? "white" : isDark ? "#E2E8F0" : "#0F172A",
    cursor: "pointer",
    fontSize: "14px",
  }),
});

export default function FormSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih",
  isMulti = false,
}) {
  // Deteksi dark mode dari class <html>
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <Select
      options={options}
      styles={getCustomStyles(isDark)}
      components={{
        DropdownIndicator,
        IndicatorSeparator: () => null,
        MultiValue,
      }}
      placeholder={placeholder}
      isSearchable
      isMulti={isMulti}
      value={
        isMulti
          ? Array.isArray(value)
            ? value[0]?.value !== undefined
              ? value
              : options.filter((opt) => value?.includes(opt.value))
            : []
          : options.find((opt) => opt.value === value) || null
      }
      onChange={(selected) =>
        onChange(
          isMulti
            ? selected?.map((item) => item) // kirim object agar "Semua" logic bekerja
            : selected?.value,
        )
      }
    />
  );
}
