const page = "min-h-[calc(100vh-64px)] bg-midnight text-ink";
const shell = "mx-auto w-11/12 max-w-7xl py-8 md:py-10";
const card =
  "rounded-2xl border border-line bg-surface/90 p-5 shadow-2xl shadow-black/20";
const cardSoft =
  "rounded-2xl border border-line bg-elevated/80 p-5 shadow-xl shadow-black/10";
const title = "text-3xl font-bold tracking-tight text-ink md:text-4xl";
const subtitle = "mt-3 max-w-3xl text-base leading-7 text-muted";
const eyebrow =
  "mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary";
const field =
  "grid gap-2.5 text-sm font-semibold text-muted-strong [&_input]:min-h-11 [&_input]:w-full [&_input]:px-4 [&_input]:py-2.5 [&_select]:min-h-11 [&_select]:w-full [&_select]:px-4 [&_select]:py-2.5 [&_textarea]:w-full [&_textarea]:px-4 [&_textarea]:py-3";
const input =
  "w-full rounded-lg border border-line bg-midnight/55 px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";
const selectInput = `${input} cursor-pointer bg-midnight/80 [color-scheme:dark]`;
const textarea = `${input} min-h-32 resize-y`;
const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold !text-midnight shadow-lg shadow-primary/15 transition hover:bg-primary-hover hover:!text-midnight disabled:cursor-not-allowed disabled:opacity-55";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-elevated px-5 py-2.5 text-sm font-bold text-muted-strong transition hover:border-primary/50 hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-55";
const dangerButton =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-bold text-danger transition hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-55";
const backLink =
  "inline-flex min-h-10 w-fit items-center justify-center rounded-lg border border-line bg-elevated px-4 py-2 text-sm font-bold text-muted-strong shadow-sm shadow-black/10 transition hover:border-primary/50 hover:bg-surface hover:text-primary-hover";
const message =
  "rounded-xl border border-line bg-elevated/80 px-4 py-3 text-sm font-semibold text-muted-strong";
const error =
  "rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger";
const success =
  "rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success";
const sectionHeader = "mb-5 flex items-center justify-between gap-4";
const sectionTitle = "text-xl font-bold text-ink";
const badge =
  "inline-flex w-fit items-center rounded-full border border-line-soft bg-elevated px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-strong";
const statusBadge =
  "inline-flex w-fit items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary";
const stockGood = "border-success/40 bg-success/10 text-success";
const stockLow = "border-accent/40 bg-accent/10 text-accent";
const stockOut = "border-danger/40 bg-danger/10 text-danger";
const list = "grid gap-4";
const row =
  "grid gap-3 rounded-xl border border-line bg-midnight/35 p-4 sm:grid-cols-[180px_1fr] sm:gap-6";
const label = "text-sm font-bold text-muted";
const value = "min-w-0 break-words text-sm text-ink";
const imageFrame =
  "flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-line bg-midnight";
const fallbackLetter =
  "flex h-full w-full items-center justify-center bg-gradient-to-br from-elevated to-midnight text-5xl font-black text-ink";
const thumbnail =
  "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-midnight";
const meta = "flex flex-wrap items-center gap-2 text-sm text-muted";

export const siteHeaderStyles = {
  header:
    "sticky top-0 z-50 border-b border-line bg-midnight/92 text-ink shadow-xl shadow-black/20 backdrop-blur",
  inner:
    "mx-auto flex min-h-16 w-11/12 max-w-7xl flex-wrap items-center justify-between gap-3 py-3",
  brand:
    "rounded-lg border border-line bg-elevated px-3 py-2 text-xl font-black tracking-tight text-ink shadow-inner shadow-white/5 transition hover:border-primary/50 hover:text-primary-hover",
  nav: "w-full flex-col gap-2 border-t border-line pt-3 text-sm font-semibold text-muted-strong md:w-auto md:flex-row md:items-center md:gap-2 md:border-0 md:pt-0",
  navOpen: "flex",
  navClosed: "hidden md:flex",
  menuButton:
    "inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-elevated px-3 py-2 text-sm font-bold text-muted-strong md:hidden",
  navLink:
    "rounded-lg px-3 py-2 transition hover:bg-elevated hover:text-primary-hover",
  registerLink:
    "rounded-lg bg-primary px-4 py-2 font-bold !text-midnight shadow-lg shadow-primary/15 transition hover:bg-primary-hover hover:!text-midnight",
  userPill:
    "rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary",
  logoutButton:
    "rounded-lg border border-line bg-elevated px-3 py-2 text-sm font-bold text-muted-strong transition hover:border-danger/40 hover:text-danger",
};

export const productCartActionStyles = {
  addButton: `${primaryButton} w-full`,
  addButtonCompact:
    "inline-flex min-h-9 min-w-20 items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-bold text-midnight transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55",
  controls:
    "grid min-h-11 w-full grid-cols-[44px_minmax(0,1fr)_44px] items-center overflow-hidden rounded-lg border-2 border-accent bg-midnight/55 text-ink shadow-lg shadow-accent/10",
  controlsCompact:
    "grid min-h-9 min-w-40 grid-cols-[36px_minmax(0,1fr)_36px] items-center overflow-hidden rounded-full border-2 border-accent bg-midnight/55 text-ink shadow-lg shadow-accent/10",
  controlButton:
    "flex h-full min-h-11 items-center justify-center px-3 text-2xl font-black text-ink transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-35",
  controlButtonCompact:
    "flex h-full min-h-9 items-center justify-center px-2 text-xl font-black text-ink transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-35",
  controlValue:
    "flex h-full min-h-11 items-center justify-center border-x border-accent/40 px-3 text-sm font-black text-accent",
  controlValueCompact:
    "flex h-full min-h-9 items-center justify-center border-x border-accent/40 px-2 text-xs font-black text-accent",
};

export const catalogStyles = {
  page,
  header:
    "mx-auto mt-3 w-11/12 max-w-7xl rounded-2xl border border-line bg-[linear-gradient(135deg,rgba(6,182,212,0.12),rgba(17,24,39,0.9)_42%,rgba(245,158,11,0.08))] px-5 py-6 md:px-8 md:py-8",
  kicker: eyebrow,
  title: "text-3xl font-black tracking-tight text-ink md:text-5xl",
  subtitle: "mt-3 max-w-3xl text-sm leading-6 text-muted md:text-base md:leading-7",
  main: "mx-auto mt-4 w-11/12 max-w-7xl pb-14",
  assistantPanel: "mb-4 grid gap-4 rounded-2xl border border-line bg-surface/90 p-4 shadow-2xl shadow-black/20 md:p-5",
  assistantPanelOpen: "",
  assistantHeader:
    "grid grid-cols-[1fr_auto] items-center gap-3 [&_h2]:text-xl [&_h2]:font-bold md:[&_h2]:text-2xl [&_p]:hidden [&_p]:max-w-3xl [&_p]:text-sm [&_p]:leading-6 [&_p]:text-muted sm:[&_p]:mt-1 sm:[&_p]:block",
  assistantHeaderActions: "flex flex-wrap items-center gap-3",
  assistantSource: `${badge} border-accent/35 bg-accent/10 text-accent`,
  assistantToggle: `${secondaryButton} md:hidden`,
  assistantBody: "hidden gap-4 md:grid",
  assistantBodyOpen: "!grid",
  assistantForm:
    "grid gap-3 md:grid-cols-[1fr_auto] [&_input]:min-h-12 [&_input]:w-full [&_input]:px-4 [&_input]:py-3 [&_button]:min-h-12 [&_button]:rounded-lg [&_button]:bg-primary [&_button]:px-5 [&_button]:font-bold [&_button]:text-midnight [&_button]:transition [&_button:hover]:bg-primary-hover [&_button:disabled]:opacity-55",
  assistantExamples:
    "flex flex-wrap gap-2 [&_button]:rounded-full [&_button]:border [&_button]:border-line [&_button]:bg-midnight/60 [&_button]:px-3 [&_button]:py-2 [&_button]:text-xs [&_button]:font-bold [&_button]:text-primary-hover [&_button]:transition [&_button:hover]:border-primary/50 [&_button:hover]:text-ink",
  assistantError: error,
  assistantResponse: "grid gap-4 text-sm text-muted-strong",
  assistantProducts: "grid gap-3 md:grid-cols-2",
  assistantProductCard:
    "flex items-center justify-between gap-3 rounded-xl border border-line bg-midnight/45 p-4 transition hover:border-primary/35 [&_a]:grid [&_a]:gap-1 [&_strong]:text-ink [&_span]:text-sm [&_span]:font-bold [&_span]:text-accent [&_small]:text-muted",
  recommendationCard: "",
  bundleSummary:
    "grid gap-3 md:grid-cols-3 [&_div]:rounded-xl [&_div]:border [&_div]:border-line [&_div]:bg-midnight/45 [&_div]:p-4 [&_dt]:text-xs [&_dt]:font-bold [&_dt]:uppercase [&_dt]:tracking-wide [&_dt]:text-muted [&_dd]:mt-1 [&_dd]:text-xl [&_dd]:font-black [&_dd]:text-accent",
  skippedCategories:
    "rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-accent [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5",
  bundleActions:
    "flex flex-wrap items-center gap-3 text-sm font-semibold text-success",
  bundleAddButton: primaryButton,
  filters:
    "mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-2xl border border-line bg-elevated/80 p-4 shadow-xl shadow-black/10 md:grid-cols-[1.5fr_0.72fr_0.72fr_0.72fr_0.86fr_auto] md:gap-4 md:p-5",
  filtersOpen: "",
  filterMobileHeader: "flex items-end md:hidden",
  filterToggle: secondaryButton,
  filterPanel:
    "col-span-2 hidden gap-5 md:col-span-5 md:grid md:grid-cols-subgrid md:items-end",
  filterPanelOpen: "!grid",
  field,
  searchField: "min-w-0 md:self-end",
  sortField: "",
  filterActions:
    "flex flex-wrap items-end gap-3 md:flex-nowrap [&_button]:min-h-11",
  filterButton: primaryButton,
  clearButton: secondaryButton,
  info: message,
  error,
  grid: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  card: `${card} flex h-full flex-col gap-4 transition hover:-translate-y-1 hover:border-primary/35`,
  cardLink: "grid flex-1 gap-4",
  cardImage: imageFrame,
  cardImageImg: "h-full w-full object-cover",
  cardImageFallback: fallbackLetter,
  cardHeader: "grid gap-2",
  price: "text-lg font-black text-accent",
  description: "line-clamp-3 text-sm leading-6 text-muted",
  meta,
  stockBadge: `${badge} normal-case`,
  goodStock: stockGood,
  lowStock: stockLow,
  outStock: stockOut,
  category: `${badge} normal-case text-primary-hover`,
  addButton: primaryButton,
  pagination: "mt-8 flex flex-wrap items-center justify-center gap-3",
  pageButton: secondaryButton,
  pageStatus: "text-sm font-bold text-muted",
};

export const authStyles = {
  page: `${page} flex items-center justify-center px-4 py-10`,
  backRow: "absolute left-4 top-20 md:left-8",
  backLink,
  card: `${card} w-full max-w-md`,
  eyebrow,
  title,
  subtitle,
  form: "mt-7 grid gap-4",
  field,
  input,
  submitButton: `${primaryButton} w-full`,
  message,
  footerText: "mt-6 text-center text-sm text-muted",
  switchLink: "font-bold text-primary transition hover:text-primary-hover",
};

export const registerStyles = authStyles;
export const loginStyles = authStyles;

export const productDetailStyles = {
  page,
  shell,
  backLink,
  info: message,
  error,
  card: `${card} mt-6`,
  hero: "grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center",
  imagePlaceholder: imageFrame,
  productImage: "h-full w-full object-cover",
  fallbackLetterLarge: fallbackLetter,
  content: "grid gap-4",
  category: `${badge} border-primary/30 bg-primary/10 text-primary-hover`,
  title: "text-4xl font-black tracking-tight text-ink md:text-5xl",
  price: "text-3xl font-black text-accent",
  description: "text-base leading-7 text-muted",
  meta,
  stockBadge: badge,
  goodStock: stockGood,
  lowStock: stockLow,
  outStock: stockOut,
  addButton: `${primaryButton} w-fit`,
  detailCartAction: "w-full max-w-xs",
};

export const cartStyles = {
  page,
  shell,
  empty: `${card} mx-auto mt-12 w-11/12 max-w-xl text-center [&_h1]:text-3xl [&_h1]:font-black`,
  subtle: "text-muted",
  header:
    "mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center [&_h1]:text-3xl [&_h1]:font-black",
  clearButton: dangerButton,
  list,
  item: `${cardSoft} flex flex-col justify-between gap-5 md:flex-row md:items-center`,
  itemTitle: "text-xl font-bold text-ink",
  stockNote: "mt-2 text-sm text-muted",
  stockWarning: "mt-2 text-sm font-bold text-accent",
  controls: "flex flex-wrap items-center gap-2",
  controlButton: secondaryButton,
  summary: `${card} mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-center [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-accent`,
  summaryActions: "flex flex-wrap items-center justify-start gap-3 md:justify-end",
  summaryLink: primaryButton,
  disabledLink:
    "inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-lg border border-line bg-elevated px-5 py-2.5 text-sm font-bold text-muted",
};

export const checkoutStyles = {
  page: `${page} px-4 py-10`,
  backRow: "mx-auto w-11/12 max-w-7xl",
  backLink,
  title: `${title} mx-auto mt-6 w-11/12 max-w-7xl`,
  subtitle: `${subtitle} mx-auto w-11/12 max-w-7xl`,
  grid: "mx-auto mt-8 grid w-11/12 max-w-7xl gap-6 lg:grid-cols-[1fr_360px]",
  form: `${card} grid gap-4 md:grid-cols-2`,
  field,
  input,
  select: selectInput,
  submitButton: `${primaryButton} md:col-span-2`,
  message: `${message} md:col-span-2`,
  summary: `${card} h-fit`,
  summaryTitle: sectionTitle,
  summaryItem:
    "mt-4 flex items-center justify-between border-b border-line pb-3 text-sm text-muted",
  summaryTotal:
    "mt-5 flex items-center justify-between text-xl font-black text-accent",
};

export const accountStyles = {
  page,
  shell,
  headerRow: "mb-8 flex items-center justify-between gap-4",
  eyebrow,
  title,
  grid: "grid gap-6 lg:grid-cols-2",
  card,
  sectionHeader,
  sectionTitle,
  form: "grid gap-4 md:grid-cols-2",
  field,
  fieldWide: `${field} md:col-span-2`,
  input,
  readOnlyInput: "bg-midnight text-muted",
  primaryButton,
  profileSubmitButton: `${primaryButton} w-full md:col-span-2`,
  secondaryButton,
  dangerButton,
  textButton:
    "inline-flex min-h-10 items-center justify-center rounded-lg border border-primary/35 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/15 hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-55",
  error,
  success,
  message,
  checkboxRow:
    "flex items-center gap-3 text-sm font-semibold text-muted-strong [&_input]:h-4 [&_input]:w-4 [&_input]:accent-primary",
  formActions: "flex flex-wrap items-center gap-3 md:col-span-2",
  addressSection: "mt-6",
  addressGrid: "grid gap-6 lg:grid-cols-[1.1fr_0.9fr]",
  addressList: "grid gap-4",
  emptyState: message,
  addressCard: `${cardSoft} grid gap-3`,
  addressHeader: "flex items-center justify-between gap-3 [&_h3]:font-bold",
  defaultBadge: `${badge} border-primary/40 bg-primary/10 text-primary`,
  addressText: "text-sm leading-6 text-muted",
  addressActions: "flex flex-wrap items-center gap-3",
  ordersCard: `${card} mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-center`,
  ordersText: "mt-2 text-sm text-muted",
  primaryLink: primaryButton,
};

export const ordersStyles = {
  page,
  shell,
  backRow: "mb-4",
  backLink,
  title,
  error,
  message,
  list: "mt-6 grid gap-5",
  card: `${card} grid gap-3`,
  row,
  label,
  value,
  statusBadge,
  detailsLink: `${primaryButton} mt-4 w-fit`,
};

export const orderDetailStyles = {
  page,
  shell,
  backRow: "mb-4",
  backLink,
  title,
  error,
  message,
  liveMessage: success,
  card: `${card} mt-6 grid gap-5`,
  section: `${cardSoft} grid gap-4`,
  sectionTitle,
  row,
  label,
  value,
  statusBadge,
  items: list,
  item: `${cardSoft} grid gap-2 sm:grid-cols-3`,
  itemName: "font-bold text-ink",
};

export const adminDashboardStyles = {
  page,
  shell,
  topRow: "mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end",
  backLink,
  title,
  subtitle,
  actions: "flex flex-wrap gap-3",
  primaryButton,
  secondaryButton,
  error,
  message,
  statsGrid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  statCard: `${cardSoft} grid gap-2`,
  statLabel: "text-sm font-bold uppercase tracking-wide text-muted",
  statValue: "text-3xl font-black text-accent",
  section: `${card} mt-6`,
  sectionHeader,
  sectionTitle,
  inlineLink: "text-sm font-bold text-primary transition hover:text-primary-hover",
  statusGrid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  statusCard: `${cardSoft} grid gap-2`,
  statusLabel: "text-sm font-bold text-muted",
  statusValue: "text-2xl font-black text-primary",
  twoColumnGrid: "grid gap-6 lg:grid-cols-2",
  list,
  listItem: `${cardSoft} flex flex-col justify-between gap-3 sm:flex-row sm:items-center`,
  itemTitle: "font-bold text-ink",
  meta: "text-sm text-muted",
  price: "font-black text-accent",
  warning: "font-black text-accent",
  danger: "font-black text-danger",
};

export const adminProductsStyles = {
  page,
  shell,
  topRow: "mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end",
  backLink,
  title,
  subtitle,
  actions: "flex flex-wrap gap-3",
  primaryButton,
  secondaryButton,
  filterRow: `${cardSoft} mb-6 grid gap-4 sm:grid-cols-[1fr_auto]`,
  select: selectInput,
  list,
  card: `${cardSoft} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`,
  cardMain: "flex min-w-0 gap-4",
  thumbnail,
  thumbnailImage: "h-full w-full object-cover",
  fallbackLetter,
  productName: "font-bold text-ink",
  meta,
  badge,
  highstock: stockGood,
  lowstock: stockLow,
  outofstock: stockOut,
  detailsLink: primaryButton,
  dangerButton,
  error,
  success,
  message,
};

export const adminOrdersStyles = {
  page,
  shell,
  topRow: "mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end",
  backLink,
  title,
  subtitle,
  filterRow: `${cardSoft} mb-7 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end`,
  select: selectInput,
  list: "grid gap-5",
  card: `${cardSoft} flex flex-col justify-between gap-4 lg:flex-row lg:items-center`,
  cardMain: "grid min-w-0 gap-2",
  orderId: "break-all font-bold text-ink",
  meta,
  badge: statusBadge,
  "status-placed": "border-primary/30 bg-primary/10 text-primary",
  "status-processing": "border-accent/40 bg-accent/10 text-accent",
  "status-shipped": "border-success/30 bg-success/10 text-success",
  "status-delivered": "border-success/30 bg-success/10 text-success",
  "status-cancelled": "border-danger/40 bg-danger/10 text-danger",
  detailsLink: primaryButton,
  secondaryButton,
  actions: "flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch",
  error,
  success,
  message,
};

export const adminOrderDetailStyles = {
  page,
  shell,
  backRow: "mb-4",
  backLink,
  title,
  message,
  card: `${card} mt-6 grid gap-5`,
  section: `${cardSoft} grid gap-4`,
  sectionTitle,
  row,
  label,
  value,
  badge: statusBadge,
  "status-placed": "border-primary/30 bg-primary/10 text-primary",
  "status-processing": "border-accent/40 bg-accent/10 text-accent",
  "status-shipped": "border-success/30 bg-success/10 text-success",
  "status-delivered": "border-success/30 bg-success/10 text-success",
  "status-cancelled": "border-danger/40 bg-danger/10 text-danger",
  items: list,
  item: `${cardSoft} grid gap-2 sm:grid-cols-3`,
  itemName: "font-bold text-ink",
  statusControls: "grid gap-3 sm:grid-cols-[1fr_auto]",
  select: selectInput,
  submitButton: primaryButton,
};

export const adminProductFormStyles = {
  page,
  shell,
  backRow: "mb-6",
  backLink,
  title,
  subtitle,
  form: `${card} grid gap-4 md:grid-cols-2`,
  field,
  input,
  textarea,
  imageHint: "text-sm text-muted",
  imagePreview: `${imageFrame} md:col-span-2`,
  imagePreviewImg: "h-full w-full object-contain",
  imagePreviewFallback: fallbackLetter,
  submitButton: `${primaryButton} md:col-span-2`,
  message: `${message} md:col-span-2`,
};

export const notFoundStyles = {
  page: `${page} flex items-center justify-center px-4 py-10`,
  card: `${card} w-full max-w-lg text-center`,
  code: "text-sm font-black uppercase tracking-[0.4em] text-primary",
  title: `${title} mt-3`,
  description: "mt-4 text-muted",
  link: `${primaryButton} mt-7`,
};
