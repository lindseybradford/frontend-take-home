import React from 'react';
import useSillyLoadingText from '@src/util/sillyLoading';
import { Button, Flex, Spinner, Text } from '@radix-ui/themes';
import { ExclamationTriangleIcon, PersonIcon, PlusIcon, ReloadIcon } from '@radix-ui/react-icons';
import { SearchField } from '@src/components/SearchField';

interface SearchConfig {
  loading: boolean;
  searchValue: string;
  placeholder: string;
  createButtonText: string;
  onSearch: (query: string) => void;
  onCreateNew: () => void;
  onClearSearch: () => void;
  debounceMs?: number;
  isSearching?: boolean;
}

interface TableUIProps<T = unknown> {
  children: React.ReactNode;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  createNewText?: string;
  onCreateNew?: () => void;
  statusHeading?: string;
  statusMessage?: string;
  data: T[];
  searchConfig?: SearchConfig;
  searchLoading?: boolean;
  deleteLoading?: boolean;
  deletingItemId?: string | null;
}

export function TableUI<T = unknown>({
  children,
  loading,
  error,
  onRetry,
  createNewText = 'Add item',
  onCreateNew,
  statusHeading = '',
  statusMessage = '',
  data,
  searchConfig,
  searchLoading = false,
  deleteLoading = false,
  deletingItemId = null,
}: TableUIProps<T>) {
  const loadingText = useSillyLoadingText();
  const hasSearchQuery = searchConfig?.searchValue && searchConfig.searchValue.length > 0;
  const hasDeleteAction = deleteLoading && deletingItemId;
  const showFullLoading = loading && !hasSearchQuery && !hasDeleteAction;

  if (showFullLoading) {
    return (
      <Flex direction="column" align="center" justify="center" height="calc(40vh)" gap="4">
        <Spinner size="2" />
        <Flex direction="column" align="center" gap="1">
          <Text as="p" weight="bold" size="2">
            Loading
          </Text>
          <Text as="p" color="gray" size="2">
            {loadingText}
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (error) {
    return (
      <>
        {searchConfig && (
          <SearchField
            searchValue={searchConfig.searchValue}
            placeholder={searchConfig.placeholder}
            createButtonText={searchConfig.createButtonText}
            onSearch={searchConfig.onSearch}
            onCreateNew={searchConfig.onCreateNew}
            onClearSearch={searchConfig.onClearSearch}
            debounceMs={searchConfig.debounceMs}
            isSearching={searchConfig.isSearching}
          />
        )}
        <Flex direction="column" align="center" justify="center" height="calc(40vh)" gap="4">
          <ExclamationTriangleIcon width="18" height="18" />
          <Flex direction="column" align="center" gap="1">
            <Text as="p" weight="bold" size="2">
              An error occurred
            </Text>
            <Text as="p" color="gray" size="2">
              Please try again and contact support if the issue persists.
            </Text>
          </Flex>
          {onRetry && (
            <Button onClick={onRetry} style={{ cursor: 'pointer' }}>
              <Flex gap="2" align="center">
                <ReloadIcon />
                Retry
              </Flex>
            </Button>
          )}
        </Flex>
      </>
    );
  }

  if (!data.length && !loading && !searchLoading) {
    return (
      <>
        {searchConfig && (
          <SearchField
            searchValue={searchConfig.searchValue}
            placeholder={searchConfig.placeholder}
            createButtonText={searchConfig.createButtonText}
            onSearch={searchConfig.onSearch}
            onCreateNew={searchConfig.onCreateNew}
            onClearSearch={searchConfig.onClearSearch}
            debounceMs={searchConfig.debounceMs}
            isSearching={searchConfig.isSearching}
          />
        )}
        <Flex direction="column" align="center" justify="center" height="calc(40vh)" gap="4">
          <PersonIcon width="18" height="18" />
          <Flex direction="column" align="center" gap="1">
            <Text as="p" weight="bold" size="2">
              {statusHeading || 'No items found'}
            </Text>
            <Text as="p" color="gray" size="2">
              {statusMessage || 'Add an item to get started.'}
            </Text>
          </Flex>
          {onCreateNew && (
            <Button onClick={onCreateNew} style={{ cursor: 'pointer' }}>
              <Flex gap="2" align="center">
                <PlusIcon />
                {createNewText}
              </Flex>
            </Button>
          )}
        </Flex>
      </>
    );
  }

  return (
    <>
      {searchConfig && (
        <SearchField
          searchValue={searchConfig.searchValue}
          placeholder={searchConfig.placeholder}
          createButtonText={searchConfig.createButtonText}
          onSearch={searchConfig.onSearch}
          onCreateNew={searchConfig.onCreateNew}
          onClearSearch={searchConfig.onClearSearch}
          debounceMs={searchConfig.debounceMs}
          isSearching={searchConfig.isSearching}
        />
      )}
      <div
        style={{
          opacity: searchLoading ? 0.5 : 1,
          pointerEvents: searchLoading ? 'none' : 'auto',
        }}
      >
        {children}
      </div>
    </>
  );
}
