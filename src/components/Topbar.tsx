import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePlausible } from 'next-plausible'

import { styled } from 'lib/style'
import { useFilters } from 'lib/filters'
import useDebounce from 'common/hooks/useDebounce'
import { useTranslations } from 'lib/i18n'

import { Sort, Search, Info, Logo, Sun, Moon, Filter } from './Icons'
import {
  Box,
  Stack,
  Text,
  Select,
  VanillaInput,
  IconButton,
  Button,
} from './UI'

const Wrapper = styled('header', {
  backgroundColor: '$panel',
  borderBottom: '1px solid $muted',

  display: 'flex',
  alignItems: 'center',

  height: '$topbar',
})

type TopbarProps = {
  onAboutOpen: () => void
  sidebarMobile: boolean
  setSidebarMobile: (status: boolean) => void
}

export const Topbar = ({
  onAboutOpen,
  sidebarMobile,
  setSidebarMobile,
}: TopbarProps) => {
  return (
    <Wrapper>
      <Left
        onAboutOpen={onAboutOpen}
        sidebarMobile={sidebarMobile}
        setSidebarMobile={setSidebarMobile}
      />
      <Main />
    </Wrapper>
  )
}

const LeftHolder = styled('div', {
  height: '100%',

  px: '$8',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  width: '100%',

  '@md': {
    width: '$sidebar',
  },
})

const Left = ({
  onAboutOpen,
  sidebarMobile,
  setSidebarMobile,
}: TopbarProps) => {
  const { t } = useTranslations()
  const plausible = usePlausible()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <LeftHolder>
      <Stack>
        <Logo />
        <IconButton
          icon={<Info />}
          onClick={() => {
            plausible('about')
            onAboutOpen()
          }}
        >
          {t('about')}
        </IconButton>
      </Stack>
      <Stack>
        {resolvedTheme && mounted && (
          <Button
            onClick={() => {
              const targetTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
              plausible('theme', { props: { theme: targetTheme } })
              setTheme(targetTheme)
            }}
          >
            <Box
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            </Box>
          </Button>
        )}
        <Button
          onClick={() => setSidebarMobile(!sidebarMobile)}
          css={{
            backgroundColor: sidebarMobile ? '$accent' : '$muted',
            color: sidebarMobile ? '$background' : '$foreground',
            '@md': { display: 'none' },
          }}
        >
          <Filter />
        </Button>
      </Stack>
    </LeftHolder>
  )
}

const MainHolder = styled('div', {
  display: 'none',

  '@md': {
    borderLeft: '1px solid $muted',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    px: '$8',

    flex: 1,
  },
})

const Main = () => {
  const { t } = useTranslations()
  const plausible = usePlausible()
  const { state, dispatch } = useFilters()
  const [search, setSearch] = useState(state.search)
  const debouncedSearch = useDebounce(search)

  useEffect(
    function commitSearch() {
      dispatch({ type: 'SET_SEARCH', payload: debouncedSearch })
    },
    [dispatch, debouncedSearch]
  )

  return (
    <MainHolder>
      <Box css={{ flex: 1 }}>
        <Box as="label" css={{ color: '$secondary' }}>
          <Stack>
            <Search />
            <VanillaInput
              placeholder={t('search.placeholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value)
              }}
            />
          </Stack>
        </Box>
      </Box>
      <Stack css={{ color: '$secondary', ml: '$8' }}>
        <Text variant="caps">{t('sort')}</Text>
        <Sort />
        <Select
          variant="small"
          css={{ color: '$foreground' }}
          value={state.sort}
          onChange={(e) => {
            plausible('sort', {
              props: {
                value: e.currentTarget.value,
              },
            })
            dispatch({
              type: 'SET_SORT',
              payload: e.currentTarget.value as 'imdb' | 'rotten',
            })
          }}
        >
          <option value="imdb">IMDB</option>
          <option value="rotten">Rotten Tomatoes</option>
        </Select>
      </Stack>
    </MainHolder>
  )
}
