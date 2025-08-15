import { Flex, Button, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon, PlusIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useState, useCallback, useEffect } from 'react';

interface SearchFieldProps {
  loading?: boolean;
  searchValue?: string;
  placeholder?: string;
  createButtonText?: string;
  onSearch?: (query: string) => void;
  onCreateNew?: () => void;
  onClearSearch?: () => void;
  debounceMs?: number;
}

export function SearchField({
  loading = false,
  searchValue = '',
  placeholder = 'Search by name',
  createButtonText = 'Add User',
  onSearch,
  onCreateNew,
  onClearSearch,
  debounceMs = 300,
}: SearchFieldProps) {
  const [inputValue, setInputValue] = useState(searchValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue !== searchValue && onSearch) {
        onSearch(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchValue, onSearch, debounceMs]);

  useEffect(() => {
    if (searchValue !== inputValue) {
      setInputValue(searchValue);
    }
  }, [searchValue]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (onSearch) {
          onSearch(inputValue);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        if (inputValue && onClearSearch) {
          setInputValue('');
          onClearSearch();
        }
      }
    },
    [inputValue, onSearch, onClearSearch]
  );

  const handleClearSearch = useCallback(() => {
    setInputValue('');
    if (onClearSearch) {
      onClearSearch();
    }
  }, [onClearSearch]);

  const showClearButton = inputValue.length > 0;

  return (
    <Flex gap="2" style={{ marginBottom: 10 }}>
      <TextField.Root
        placeholder={placeholder}
        value={inputValue}
        onChange={event => handleInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flexGrow: 1 }}
        disabled={loading}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
        {showClearButton && (
          <TextField.Slot>
            <Button
              size="1"
              variant="ghost"
              onClick={handleClearSearch}
              disabled={loading}
              style={{ cursor: 'pointer', marginRight: 1 }}
            >
              <Cross2Icon height="12" width="12" />
            </Button>
          </TextField.Slot>
        )}
      </TextField.Root>

      <Button
        onClick={onCreateNew}
        loading={loading}
        disabled={loading}
        style={{ cursor: 'pointer' }}
      >
        <PlusIcon height="16" width="16" /> {createButtonText}
      </Button>
    </Flex>
  );
}
