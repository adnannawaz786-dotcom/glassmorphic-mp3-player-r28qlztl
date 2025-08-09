import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const SearchBar = ({ 
  onSearch, 
  onFilter, 
  onSort, 
  searchQuery = '', 
  sortBy = 'title', 
  sortOrder = 'asc',
  filterBy = 'all',
  totalTracks = 0,
  filteredTracks = 0
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder);
  const [localFilter, setLocalFilter] = useState(filterBy);

  const handleSearch = (value) => {
    setQuery(value);
    onSearch && onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch && onSearch('');
  };

  const handleSort = (field) => {
    const newOrder = localSortBy === field && localSortOrder === 'asc' ? 'desc' : 'asc';
    setLocalSortBy(field);
    setLocalSortOrder(newOrder);
    onSort && onSort(field, newOrder);
  };

  const handleFilter = (filter) => {
    setLocalFilter(filter);
    onFilter && onFilter(filter);
  };

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'artist', label: 'Artist' },
    { value: 'album', label: 'Album' },
    { value: 'duration', label: 'Duration' },
    { value: 'dateAdded', label: 'Date Added' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Tracks' },
    { value: 'favorites', label: 'Favorites' },
    { value: 'recent', label: 'Recently Played' },
    { value: 'unplayed', label: 'Unplayed' }
  ];

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="p-4">
          <div className="relative flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search tracks, artists, albums..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              />
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-3 w-3 text-white/60" />
                </motion.button>
              )}
            </div>

            {/* Filter Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 ${
                showFilters ? 'bg-white/10 text-white' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Results Count */}
          {query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-white/60"
            >
              {filteredTracks} of {totalTracks} tracks
            </motion.div>
          )}
        </div>
      </Card>

      {/* Filters Panel */}
      <motion.div
        initial={false}
        animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-lg">
          <div className="p-4 space-y-4">
            {/* Sort Options */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-2">Sort by</h3>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(option.value)}
                    className={`text-xs px-3 py-1.5 h-auto transition-all duration-200 ${
                      localSortBy === option.value
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{option.label}</span>
                    {localSortBy === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-1"
                      >
                        {localSortOrder === 'asc' ? (
                          <SortAsc className="h-3 w-3" />
                        ) : (
                          <SortDesc className="h-3 w-3" />
                        )}
                      </motion.div>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-2">Filter by</h3>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilter(option.value)}
                    className={`text-xs px-3 py-1.5 h-auto transition-all duration-200 ${
                      localFilter === option.value
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SearchBar;