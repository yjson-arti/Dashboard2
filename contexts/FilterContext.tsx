import React, { createContext, useContext, useState, ReactNode } from 'react';
import { COUNTRIES, PLATFORMS, INDUSTRIES, PRODUCTS, CAMPAIGNS, COMPANY_SIZES } from '../constants';

export interface FilterState {
  countries: string[];
  platforms: string[];
  industries: string[];
  products: string[];
  campaigns: string[];
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>({
    countries: COUNTRIES,
    platforms: PLATFORMS,
    industries: INDUSTRIES,
    products: PRODUCTS,
    campaigns: CAMPAIGNS,
  });

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
