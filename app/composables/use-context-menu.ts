import type { MenuItemOptions, MenuOptions } from '@tauri-apps/api/menu'
import { Menu } from '@tauri-apps/api/menu'

export function useContextMenu() {
  const createMenu = (items: MenuItemOptions[], opts?: Omit<MenuOptions, 'items'>) => useAsyncState(async () => Menu.new({
    ...opts,
    items,
  }), undefined)

  return {
    createMenu,
  }
}
