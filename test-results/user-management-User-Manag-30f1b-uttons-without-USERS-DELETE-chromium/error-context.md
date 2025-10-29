# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: Dernek Yönetim Sistemi
      - paragraph [ref=e6]: Hesabınıza giriş yapın
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e11]: E-posta
        - textbox "E-posta" [ref=e12]:
          - /placeholder: ornek@email.com
          - text: viewer@test.com
      - generic [ref=e13]:
        - generic [ref=e15]: Şifre
        - textbox "Şifre" [ref=e16]:
          - /placeholder: ••••••••
          - text: viewer123
      - button "Giriş Yap" [ref=e17]
      - generic [ref=e18]:
        - paragraph [ref=e19]: "Test Hesapları:"
        - generic [ref=e20]:
          - paragraph [ref=e21]: "Admin: admin@test.com / admin123"
          - paragraph [ref=e22]: "Manager: manager@test.com / manager123"
          - paragraph [ref=e23]: "Member: member@test.com / member123"
          - paragraph [ref=e24]: "Viewer: viewer@test.com / viewer123"
  - region "Notifications alt+T"
  - generic [ref=e25]:
    - img [ref=e27]
    - button "Open Tanstack query devtools" [ref=e75] [cursor=pointer]:
      - img [ref=e76]
  - button "Open Next.js Dev Tools" [ref=e129] [cursor=pointer]:
    - img [ref=e130]
  - alert [ref=e133]
```