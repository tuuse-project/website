<script setup>
import { ref , computed} from 'vue';
import { useRoute } from 'vue-router';
import { Instagram, Mail} from 'lucide-vue-next';

const route = useRoute();

const privacyPolicyLink = computed(() => {
  const lang = route.path.split('/')[1]?.toLowerCase();

  if (lang === 'ru') return '/ru/privacy-policy';
  if (lang === 'ro') return '/ro/privacy-policy';

  return '/privacy-policy';
});

const privacyPolicyText = computed(() => {
  const lang = route.path.split('/')[1]?.toLowerCase();

  if (lang === 'ru') return 'Политика конфиденциальности';
  if (lang === 'ro') return 'Politica de confidențialitate';

  return 'Privacy Policy';
});
</script>
<template>
  <footer class="footer">
    <div class="container footer__container">
      <div class="footer__top">
        <div class="footer-logo">
          <img src="~/assets/images/logo.png" alt="TUUSE">
        </div>
        <div class="footer-contacts">
          <a href="https://instagram.com/tuuse.project">
            <Instagram />
            tuuse.project
          </a>
          <a href="mailto:support@tuuse.space">
            <Mail />
            support@tuuse.space
          </a>
        </div>
      </div>
     
      <div class="footer__bottom">
      <p>
        © 2026 TUUSE. All rights reserved.
      </p>
        <nav>
        <!-- <a :href="privacyPolicyLink">
          {{ privacyPolicyText }}
        </a> -->
       
      </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);

  /* padding: 3rem 0; */

}

.footer__container {
  display: flex;

  flex-direction: column;
}
.footer__top, .footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.footer-logo {
  font-family: 'Orbitron', sans-serif;

  letter-spacing: .2em;
}
.footer-logo img {
  width: 150px;
  height: auto;
}
.footer p {
  color: var(--muted);
}

.footer__bottom {
  border-top: solid 1px var(--border-light);
  padding-top: 1rem;
  padding-bottom: 1rem;
}

@media (max-width: 640px) {
  .footer__container {
    flex-direction: column;
    gap: 1rem;
  }
}

.footer__bottom nav a {
  color: var(--muted);
  font-size: .92rem;
  transition: var(--transition);
}

.footer-contacts {
  display: flex;
  gap: 0.75rem;
  font-weight: 200 !important;
  align-items: center;
}
.footer-contacts a {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  color: var(--muted);
  transition: var(--transition);
}

.footer-contacts a:hover {
  color: var(--text);
  background-size: 100% 0.125rem;
  background-position-x: left;
}
.footer a:hover {
  color: var(--text);
}

.footer-contacts svg {
  stroke-width: 1px;
  transition: var(--transition);
}
.footer-contacts a:hover svg {
  stroke-width: 2px;
}

@media (max-width: 768px) {
  .footer__top {
    flex-direction: column;
    align-items: center;
  }
  .footer__bottom {
    flex-direction: column-reverse;
    align-items: center;

  }
  .footer-contacts {
    flex-direction: column;
    align-items: center;
  }
}
</style>