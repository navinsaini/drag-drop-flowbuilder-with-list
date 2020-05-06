import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NodeComponent } from './node/node.component';

@NgModule({
  declarations: [
    AppComponent,
    NodeComponent
  ],
  imports: [
    BrowserModule,
    DragDropModule,
    AppRoutingModule
  ],
  providers: [],
  entryComponents: [NodeComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
