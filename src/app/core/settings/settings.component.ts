import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { MenuItem } from "primeng/api";
import { Subscription } from "rxjs";
import { routes } from "src/app/shared/routes/routes";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent {
  items: MenuItem[] = [];
  settingCategory = "";
  routes = routes;
  currentRoute!: string;
  text: string = "";
  routerChangeSubscription: Subscription;
  constructor(private router: Router) {
    this.routerChangeSubscription = this.router.events.subscribe((event) => {
      this.currentRoute = this.router.url;
      // console.log(this.currentRoute)
    });
  }
  ngOnInit() {
    this.routerChangeSubscription = this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
      this.updateBreadcrumb();
    });

    // this.findPageName('Profile Information')
    this.items = [
      {
        label: "File",
        icon: "pi pi-fw pi-file",
        items: [
          {
            label: "New",
            icon: "pi pi-fw pi-plus",
            items: [
              {
                label: "Bookmark",
                icon: "pi pi-fw pi-bookmark",
              },
              {
                label: "Video",
                icon: "pi pi-fw pi-video",
              },
            ],
          },
          {
            label: "Delete",
            icon: "pi pi-fw pi-trash",
          },
          {
            separator: true,
          },
          {
            label: "Export",
            icon: "pi pi-fw pi-external-link",
          },
        ],
      },
      {
        label: "Edit",
        icon: "pi pi-fw pi-pencil",
        items: [
          {
            label: "Left",
            icon: "pi pi-fw pi-align-left",
          },
          {
            label: "Right",
            icon: "pi pi-fw pi-align-right",
          },
          {
            label: "Center",
            icon: "pi pi-fw pi-align-center",
          },
          {
            label: "Justify",
            icon: "pi pi-fw pi-align-justify",
          },
        ],
      },
      {
        label: "Users",
        icon: "pi pi-fw pi-user",
        items: [
          {
            label: "New",
            icon: "pi pi-fw pi-user-plus",
          },
          {
            label: "Delete",
            icon: "pi pi-fw pi-user-minus",
          },
          {
            label: "Search",
            icon: "pi pi-fw pi-users",
            items: [
              {
                label: "Filter",
                icon: "pi pi-fw pi-filter",
                items: [
                  {
                    label: "Print",
                    icon: "pi pi-fw pi-print",
                  },
                ],
              },
              {
                icon: "pi pi-fw pi-bars",
                label: "List",
              },
            ],
          },
        ],
      },
      {
        label: "Events",
        icon: "pi pi-fw pi-calendar",
        items: [
          {
            label: "Edit",
            icon: "pi pi-fw pi-pencil",
            items: [
              {
                label: "Save",
                icon: "pi pi-fw pi-calendar-plus",
              },
              {
                label: "Delete",
                icon: "pi pi-fw pi-calendar-minus",
              },
            ],
          },
          {
            label: "Archieve",
            icon: "pi pi-fw pi-calendar-times",
            items: [
              {
                label: "Remove",
                icon: "pi pi-fw pi-calendar-minus",
              },
            ],
          },
        ],
      },
    ];
  }

  updateBreadcrumb() {
    const path = this.router.url.split("/").pop(); // Get the last part of the URL

    switch (path) {
      case "practice-information":
        this.text = "Profile Information";
        break;
      case "warehouse":
        this.text = "Warehouse";
        break;
      case "users":
        this.text = "Users Settings";
        break;
      case "categories":
        this.text = "Categories";
        break;
      case "subCategories":
        this.text = "Sub Categories";
        break;
      case "billing-Address":
        this.text = "Billing Address";
        break;
      case "taxes":
        this.text = "Taxes";
        break;
      default:
        this.text = "Profile Information"; // Default case
        break;
    }
  }

  changeCalendarSettingCategory(type: string) {}

  ngOnDestroy() {
    if (this.routerChangeSubscription) {
      this.routerChangeSubscription.unsubscribe();
    }
  }

  isRouteActive(text) {
    if (!this.currentRoute) return "";
    let str = this.currentRoute?.includes(text);
    if (str) {
      return "active";
    } else {
      return "non-active";
    }
  }
  findPageName(text) {
    this.text = text;
  }
}
