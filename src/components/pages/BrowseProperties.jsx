import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useFilters } from "@/hooks/useFilters";
import { propertyService } from "@/services/api/propertyService";
import FilterSidebar from "@/components/organisms/FilterSidebar";
import PropertyGrid from "@/components/organisms/PropertyGrid";
import PropertyList from "@/components/organisms/PropertyList";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const BrowseProperties = () => {
  const { searchTerm, currentView } = useOutletContext();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("date-new");
  const [savedProperties, setSavedProperties] = useLocalStorage("savedProperties", []);
  
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useFilters();

  const loadProperties = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (err) {
      setError("Failed to load properties. Please try again.");
      console.error("Error loading properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchLower) ||
        property.address.city.toLowerCase().includes(searchLower) ||
        property.address.state.toLowerCase().includes(searchLower) ||
        property.address.street.toLowerCase().includes(searchLower) ||
        property.type.toLowerCase().includes(searchLower)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(property =>
      property.price >= filters.priceMin && property.price <= filters.priceMax
    );

    // Apply property type filter
    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter(property =>
        filters.propertyTypes.includes(property.type)
      );
    }

    // Apply bedroom filter
    if (filters.bedroomsMin > 0) {
      filtered = filtered.filter(property =>
        property.bedrooms >= filters.bedroomsMin
      );
    }

    // Apply bathroom filter
    if (filters.bathroomsMin > 0) {
      filtered = filtered.filter(property =>
        property.bathrooms >= filters.bathroomsMin
      );
    }

    // Apply square footage filter
    if (filters.squareFeetMin > 0) {
      filtered = filtered.filter(property =>
        property.squareFeet >= filters.squareFeetMin
      );
    }

    // Apply features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(property =>
        filters.features.every(feature =>
          property.features.includes(feature)
        )
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "date-new":
        filtered.sort((a, b) => new Date(b.listingDate) - new Date(a.listingDate));
        break;
      case "date-old":
        filtered.sort((a, b) => new Date(a.listingDate) - new Date(b.listingDate));
        break;
      case "size-large":
        filtered.sort((a, b) => b.squareFeet - a.squareFeet);
        break;
      case "size-small":
        filtered.sort((a, b) => a.squareFeet - b.squareFeet);
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  };

  const handleToggleFavorite = (propertyId) => {
    const newSavedProperties = savedProperties.includes(propertyId)
      ? savedProperties.filter(id => id !== propertyId)
      : [...savedProperties, propertyId];
    
    setSavedProperties(newSavedProperties);
    
    const property = properties.find(p => p.Id === propertyId);
    if (property) {
      toast.success(
        savedProperties.includes(propertyId)
          ? "Property removed from favorites"
          : "Property added to favorites"
      );
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    toast.success("Filters reset successfully");
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded shimmer" />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <Loading type={currentView} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message={error} onRetry={loadProperties} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={updateFilter}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters()}
            sortBy={sortBy}
            onSortChange={setSortBy}
            isOpen={true}
            onClose={() => {}}
          />
        </div>

        {/* Mobile Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters()}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          className="lg:hidden"
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <Button
              onClick={() => setIsFilterOpen(true)}
              variant="outline"
              className="w-full justify-center"
            >
              <ApperIcon name="Filter" className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters() && (
                <span className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Properties for Sale..
              </h1>
              <div className="text-sm text-gray-600">
                {filteredProperties.length} properties found
              </div>
            </div>
          </div>

          {/* Property Results */}
          {filteredProperties.length === 0 ? (
            <Empty
              title="No properties found"
              description="Try adjusting your search criteria or browse all available properties."
              actionText="Reset Filters"
              onAction={hasActiveFilters() ? handleResetFilters : undefined}
              icon="Home"
            />
          ) : (
            <>
              {currentView === "grid" ? (
                <PropertyGrid
                  properties={filteredProperties}
                  favorites={savedProperties}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : (
                <PropertyList
                  properties={filteredProperties}
                  favorites={savedProperties}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseProperties;
