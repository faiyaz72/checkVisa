<template>
  <nav
    class="fixed top-0 w-full z-50 h-20 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,21,42,0.04)]"
  >
    <div
      class="flex justify-between items-center h-full px-8 max-w-screen-2xl mx-auto"
    >
      <div class="flex items-center gap-2 group cursor-pointer">
        <img :src="logo" :alt="t('nav.brand')" class="w-8 h-8" />
        <span
          class="font-display text-xl font-bold tracking-tighter text-pp-primary-container"
        >
          {{ t("nav.brand") }}
        </span>
      </div>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" :class="navigationMenuTriggerStyle()">
              {{ t("nav.links.howItWorks") }}
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" :class="navigationMenuTriggerStyle()">
              {{ t("nav.links.globalNetwork") }}
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#" :class="navigationMenuTriggerStyle()">
              {{ t("nav.links.about") }}
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import logo from "@/assets/logo.svg";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const { t } = useI18n();
</script>
