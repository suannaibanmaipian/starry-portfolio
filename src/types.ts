export interface Profile { name:string; role:string; bio:string; about:string; email:string; github:string; location:string }
export interface Skill { id:string; name:string; category:string; level:number }
export interface Project { id:string; title:string; summary:string; category:string; tags:string; description:string; url:string; featured:boolean }
export interface Post { id:string; title:string; excerpt:string; content:string; date:string; published:boolean }
export interface Settings { siteTitle:string; siteDescription:string }
export interface PortfolioData { profile:Profile; skills:Skill[]; projects:Project[]; posts:Post[]; settings:Settings }
