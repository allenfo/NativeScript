﻿import * as TKUnit from "../TKUnit";
import * as view from "tns-core-modules/ui/core/view";
import * as builder from "tns-core-modules/ui/builder";
import * as buttonModule from "tns-core-modules/ui/button";
import * as switchModule from "tns-core-modules/ui/switch";
import * as searchBarModule from "tns-core-modules/ui/search-bar";
import * as textFieldModule from "tns-core-modules/ui/text-field";
import * as gridLayoutModule from "tns-core-modules/ui/layouts/grid-layout";
import * as absoluteLayoutModule from "tns-core-modules/ui/layouts/absolute-layout";
import * as types from "tns-core-modules/utils/types";
import * as fs from "tns-core-modules/file-system";
import * as observable from "tns-core-modules/data/observable";
import * as stackLayoutModule from "tns-core-modules/ui/layouts/stack-layout";
import { Label } from "tns-core-modules/ui/label";
import { Page } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";
import { TabView } from "tns-core-modules/ui/tab-view";
import { Observable } from "tns-core-modules/data/observable";
import { TemplateView } from "./template-builder-tests/template-view";
import * as myCustomControlWithoutXml from "./mymodule/MyControl";
import * as listViewModule from "tns-core-modules/ui/list-view";
import * as helper from "../ui/helper";
import * as viewModule from "tns-core-modules/ui/core/view";
import * as platform from "tns-core-modules/platform";
import * as gesturesModule from "tns-core-modules/ui/gestures";
import * as segmentedBar from "tns-core-modules/ui/segmented-bar";
import { Source } from "tns-core-modules/utils/debug";
import { PercentLength, Length } from "tns-core-modules/ui/core/view";

export function test_load_IsDefined() {
    TKUnit.assertTrue(types.isFunction(builder.load), "ui/builder should have load method!");
};

export function test_parse_IsDefined() {
    TKUnit.assertTrue(types.isFunction(builder.parse), "ui/builder should have parse method!");
};

export function test_load_ShouldThrowWithInvalidFileName() {
    let fileName = fs.path.join(__dirname, "invalid-page.xml");
    TKUnit.assertThrows(() => builder.load(fileName),
        "Loading component from a missing module SHOULD throw an error.");
};

export function test_load_ShouldNotCrashWithoutExports() {
    var v = builder.load(fs.path.join(__dirname, "mainPage.xml"));
    TKUnit.assertTrue(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};


export function test_loadInheritedPageAndResolveFromChild() {
    var basePath = "xml-declaration/";
    helper.navigateToModuleAndRunTest(basePath + "inherited-page", null, (page) => {
        let contentLabel = <Label>page.content;
        TKUnit.assertEqual("Inherited and loaded", contentLabel.text);

        let discoveredPage = contentLabel.page;
        TKUnit.assertEqual(page, discoveredPage);

        let discoveredAncestorByBaseType = viewModule.getAncestor(contentLabel, Page);
        TKUnit.assertEqual(page, discoveredAncestorByBaseType);

        let discoveredAncestorByInheritedTypeName = viewModule.getAncestor(contentLabel, "InheritedPage");
        TKUnit.assertEqual(page, discoveredAncestorByInheritedTypeName);
    });
}

export function test_loadWithOptionsWithXML() {
    var v = builder.load({
        path: "~/xml-declaration/mymodulewithxml",
        name: "MyControl",
        exports: exports,
        page: new Page()
    });
    TKUnit.assertTrue(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};

export function test_loadWithOptionsWithXML_CSSIsApplied() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = new Page();

        newPage.content = builder.load({
            path: "~/xml-declaration/mymodulewithxml",
            name: "MyControl",
            exports: exports,
            page: newPage
        });

        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    helper.assertViewBackgroundColor(newPage.content, "#008000");
};

export function test_loadWithOptionsFromTNS() {
    var v = builder.load({
        path: "ui/label",
        name: "Label"
    });

    TKUnit.assert(v instanceof Label, "Expected result: Label; Actual result: " + v + ";");
};

export function test_loadWithOptionsFromTNSPath() {
    var v = builder.load({
        path: "ui/label",
        name: "Label"
    });

    TKUnit.assert(v instanceof Label, "Expected result: Label; Actual result: " + v + ";");
};

export function test_loadWithAttributes() {
    var lText = "Nativescript rocks";
    var lWrap = true;
    var lColor = "#FF0000"; // red

    var v = builder.load({
        path: "ui/label",
        name: "Label",
        attributes: {
            text: lText,
            textWrap: lWrap,
            style: "color: " + lColor + ";"
        }
    });

    TKUnit.assertEqual(v["text"], lText, "Expected result: true; Actual result: " + v + ";");
    TKUnit.assertEqual(v["textWrap"], true, "Expected result: true; Actual result: " + v + ";");
    helper.assertViewColor(v, lColor);
};

export function test_parse_ShouldNotCrashWithoutExports() {
    var file = fs.File.fromPath(fs.path.join(__dirname, "mainPage.xml"));
    var text = file.readTextSync();

    var v: view.View = builder.parse(text);
    TKUnit.assert(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
};


export function test_parse_ShouldFindEventHandlersInExports() {
    var loaded;
    var page = builder.parse("<Page loaded='myLoaded'></Page>", {
        myLoaded: args => {
            loaded = true;
        }
    });
    page._emit("loaded");

    TKUnit.assertTrue(loaded, "Parse should find event handlers in exports.");
};

export function test_parse_ShouldFindEventHandlersWithOnInExports() {
    var loaded;
    var page = builder.parse("<Page onloaded='myLoaded'></Page>", {
        myLoaded: args => {
            loaded = true;
        }
    });
    page._emit("loaded");

    TKUnit.assertTrue(loaded, "Parse should find event handlers in exports.");
};

export function test_parse_ShouldSetGridAttachedProperties() {
    var p = <Page>builder.parse("<Page><GridLayout><Label row='1' col='2' rowSpan='3' colSpan='4' /></GridLayout></Page>");
    var grid = <gridLayoutModule.GridLayout>p.content;
    var child = grid.getChildAt(0);

    var col = gridLayoutModule.GridLayout.getColumn(child);
    TKUnit.assertEqual(col, 2, "Expected result for grid column: 2; Actual result: " + col + ";");

    var row = gridLayoutModule.GridLayout.getRow(child);
    TKUnit.assertEqual(row, 1, "Expected result for grid row: 1; Actual result: " + row + ";");

    var colSpan = gridLayoutModule.GridLayout.getColumnSpan(child);
    TKUnit.assertEqual(colSpan, 4, "Expected result for grid column span: 4; Actual result: " + colSpan + ";");

    var rowSpan = gridLayoutModule.GridLayout.getRowSpan(child);
    TKUnit.assertEqual(rowSpan, 3, "Expected result for grid row span: 3; Actual result: " + rowSpan + ";");
};

export function test_parse_ShouldSetCanvasAttachedProperties() {
    var p = <Page>builder.parse("<Page><AbsoluteLayout><Label left='1' top='2' right='3' bottom='4' /></AbsoluteLayout></Page>");
    var absLayout = <absoluteLayoutModule.AbsoluteLayout>p.content;
    var child = absLayout.getChildAt(0);

    var left = absoluteLayoutModule.AbsoluteLayout.getLeft(child);

    TKUnit.assert(Length.equals(left, Length.parse("1")), `Expected result for canvas left: 1; Actual result: ${(<any>left).value};`)

    var top = absoluteLayoutModule.AbsoluteLayout.getTop(child);
    TKUnit.assert(Length.equals(top, Length.parse("2")), `Expected result for canvas top: 2; Actual result: ${(<any>top).value};`)
};

export function test_parse_ShouldParseNumberProperties() {
    var p = <Page>builder.parse("<Page width='100' />");
    TKUnit.assertTrue(PercentLength.equals(p.width, 100));
};

export function test_parse_ShouldParseBooleanProperties() {
    var p = <Page>builder.parse("<Page><Switch checked='true' /></Page>");
    var sw = <switchModule.Switch>p.content;

    TKUnit.assertTrue(sw.checked, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBooleanPropertiesIgnoreCase() {
    var p = <Page>builder.parse("<Page><Switch checked='False' /></Page>");
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === false, "Expected result: false; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBooleanPropertiesIgnoreCaseInverted() {
    var p = <Page>builder.parse("<Page><TextField editable='False' /></Page>");
    var tf = <textFieldModule.TextField>p.content;

    TKUnit.assertFalse(tf.editable, "Expected result: false; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
};

export function test_parse_ShouldParsePlatformSpecificProperties() {
    var p = <Page>builder.parse("<Page><TextField ios:editable='False' android:editable='True' /></Page>");
    var tf = <textFieldModule.TextField>p.content;

    if (platform.device.os === platform.platformNames.ios) {
        TKUnit.assertFalse(tf.editable, "Expected result: false; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
    } else {
        TKUnit.assertTrue(tf.editable, "Expected result: true; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
    }
};

export function test_parse_ShouldParsePlatformSpecificComponents() {
    var p = <Page>builder.parse("<Page><ios><TextField /></ios><android><Label /></android></Page>");
    if (platform.device.os === platform.platformNames.ios) {
        TKUnit.assert(p.content instanceof textFieldModule.TextField, "Expected result: TextField; Actual result: " + p.content);
    }
    else {
        TKUnit.assert(p.content instanceof Label, "Expected result: Label; Actual result: " + p.content);
    }
};

export function test_parse_ThrowErrorWhenNestingPlatforms() {
    var e: Error;
    try {
        builder.parse("<Page><ios><TextField /><android><Label /></android></ios></Page>");
    } catch (ex) {
        e = ex;
    }

    TKUnit.assert(e, "Expected result: Error; Actual result: " + e);
};

export function test_parse_ShouldParseBindings() {
    var p = <Page>builder.parse("<Page><Switch checked='{{ myProp }}' /></Page>");
    p.bindingContext = { myProp: true };
    var sw = <switchModule.Switch>p.content;

    TKUnit.assertTrue(sw.checked, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBindingsWithObservable() {
    var p = <Page>builder.parse("<Page><Switch checked='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", true);
    p.bindingContext = obj;
    var sw = <switchModule.Switch>p.content;

    TKUnit.assertTrue(sw.checked, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));

    obj.set("myProp", false);

    TKUnit.assertFalse(sw.checked, "Expected result: false; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
};

export function test_parse_ShouldParseBindingsToEvents() {
    var p = <Page>builder.parse("<Page><Button tap='{{ myTap }}' /></Page>");
    p.bindingContext = {
        myTap: function (args) {
            //
        }
    };
    var btn = <buttonModule.Button>p.content;

    TKUnit.assert(btn.hasListeners("tap"), "Expected result: true.");
};

export function test_parse_ShouldParseBindingsToEventsWithOn() {
    var p = <Page>builder.parse("<Page><Button ontap='{{ myTap }}' /></Page>");
    p.bindingContext = {
        myTap: function (args) {
            //
        }
    };
    var btn = <buttonModule.Button>p.content;

    TKUnit.assert(btn.hasListeners("tap"), "Expected result: true.");
};

export function test_parse_ShouldParseBindingsToGestures() {
    var p = <Page>builder.parse("<Page><Label tap='{{ myTap }}' /></Page>");
    var context = {
        myTap: function (args) {
            //
        }
    };

    p.bindingContext = context;
    var lbl = <Label>p.content;

    var observer = (<view.View>lbl).getGestureObservers(gesturesModule.GestureTypes.tap)[0];

    TKUnit.assert(observer !== undefined, "Expected result: true.");
    TKUnit.assert(observer.context === context, "Context should be equal to binding context. Actual result: " + observer.context);
};

export function test_parse_ShouldParseBindingsToGesturesWithOn() {
    var p = <Page>builder.parse("<Page><Label ontap='{{ myTap }}' /></Page>");
    var context = {
        myTap: function (args) {
            //
        }
    };

    p.bindingContext = context;
    var lbl = <Label>p.content;

    var observer = (<view.View>lbl).getGestureObservers(gesturesModule.GestureTypes.tap)[0];

    TKUnit.assert(observer !== undefined, "Expected result: true.");
    TKUnit.assert(observer.context === context, "Context should be equal to binding context. Actual result: " + observer.context);
};

export function test_parse_ShouldParseSubProperties() {
    var p = <Page>builder.parse("<Page><Switch style.visibility='collapse' checked='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", true);
    p.bindingContext = obj;
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.visibility === "collapse", "Expected result: collapse; Actual result: " + sw.visibility + "; type: " + typeof (sw.visibility));
};

export function test_parse_ShouldParseBindingToSpecialProperty() {
    var classProp = "MyClass";
    var p = <Page>builder.parse("<Page><Label class='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", classProp);
    p.bindingContext = obj;

    TKUnit.assertEqual(p.content.className, classProp);
    TKUnit.assertEqual(p.content.cssClasses.size, 1);
};

export function test_parse_ShouldParseBindingsWithCommaInsideSingleQuote() {
    var expected = "Hi,test"
    var bindingString = "{{ 'Hi,' + myProp }}";
    var p = <Page>builder.parse("<Page><Label text=\"" + bindingString + "\" /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", "test");
    p.bindingContext = obj;
    var lbl = <Label>p.content;

    TKUnit.assert(lbl.text === expected, "Expected " + expected + "; Actual result: " + lbl.text + "; type: " + typeof (lbl.text));
};

export function test_parse_ShouldParseBindingsWithCommaInsideDoubleQuote() {
    var expected = "Hi,test"
    var bindingString = "{{ \"Hi,\" + myProp }}";
    var p = <Page>builder.parse("<Page><Label text='" + bindingString + "' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", "test");
    p.bindingContext = obj;
    var lbl = <Label>p.content;

    TKUnit.assert(lbl.text === expected, "Expected " + expected + "; Actual result: " + lbl.text + "; type: " + typeof (lbl.text));
};

export function test_parse_CanBindBackgroundImage() {
    var p = <Page>builder.parse("<Page><StackLayout backgroundImage='{{ myProp }}' /></Page>");
    var expected = "~/logo.png"
    var obj = new observable.Observable();
    obj.set("myProp", expected);
    p.bindingContext = obj;
    var sw = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assert(sw.backgroundImage === expected, "Expected result: " + expected + "; Actual result: " + sw.backgroundImage);
};

export function test_parse_ShouldParseLowerCaseDashedComponentDeclaration() {
    var p = <Page>builder.parse("<page><stack-layout><label text=\"Label\" /><segmented-bar><segmented-bar.items><segmented-bar-item title=\"test\" /></segmented-bar.items></segmented-bar></stack-layout></page>");
    var ctrl = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assert(ctrl instanceof stackLayoutModule.StackLayout, "Expected result: StackLayout!; Actual result: " + ctrl);
    TKUnit.assert(ctrl.getChildAt(0) instanceof Label, "Expected result: Label!; Actual result: " + ctrl.getChildAt(0));
    TKUnit.assert(ctrl.getChildAt(1) instanceof segmentedBar.SegmentedBar, "Expected result: Label!; Actual result: " + ctrl.getChildAt(0));
};


export function test_parse_ShouldParseCustomComponentWithoutXmlFromTNSModules() {
    var p = <Page>builder.parse("<Page xmlns" + ":customControls=\"ui/label\"><customControls:Label /></Page>");
    var ctrl = p.content;

    TKUnit.assert(ctrl instanceof Label, "Expected result: custom control is defined!; Actual result: " + ctrl);
};

export function test_parse_ShouldParseCustomComponentWithoutXmlFromTNSModulesWhenNotSpecified() {
    var p = <Page>builder.parse("<Page xmlns" + ":customControls=\"ui/label\"><customControls:Label /></Page>");
    var ctrl = p.content;

    TKUnit.assert(ctrl instanceof Label, "Expected result: custom control is defined!; Actual result: " + ctrl);
};

export function test_parse_ShouldParseCustomComponentWithXml() {
    var p = <Page>builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:MyControl /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;
    var lbl = <Label>panel.getChildAt(0);

    TKUnit.assert(lbl.text === "mymodulewithxml", "Expected result: 'mymodulewithxml'; Actual result: " + lbl);
};

export function test_parse_ShouldParseCustomComponentWithXml_WithAttributes() {
    var p = <Page>builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:MyControl visibility=\"collapse\" /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel.visibility, "collapse", "panel.visibility");
};

export function test_parse_ShouldParseCustomComponentWithXml_WithCustomAttributes() {
    var p = <Page>builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:MyControl myProperty=\"myValue\" /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel["myProperty"], "myValue", "customControl.myProperty");
};

export function test_parse_ShouldParseCustomComponentWithXmlNoJS() {
    var p = <Page>builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:my-control-no-js /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;
    var lbl = <Label>panel.getChildAt(0);

    TKUnit.assertEqual(lbl.text, "I'm all about taht XML, no JS", "label.text");
};

export function test_parse_ShouldParseCustomComponentWithXmlNoJS_WithAttributes() {
    var p = <Page>builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:my-control-no-js visibility=\"collapse\" /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel.visibility, "collapse", "panel.visibility");
};

export function test_parse_ShouldParseCustomComponentWithXmlNoJS_WithCustomAttributes() {
    var p = <Page>builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:my-control-no-js myProperty=\"myValue\" /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel["myProperty"], "myValue", "customControl.myProperty");
};

export function test_EventInCodelessFragment() {
    var pageCode = require("./template-builder-tests/event-in-codeless-fragment");

    var notified = false;
    pageCode.test = (args) => {
        notified = true;
    }

    var page = builder.load(__dirname + "/template-builder-tests/event-in-codeless-fragment.xml", pageCode);
    TKUnit.assert(view, "Expected the xml to generate a page");
    var templateView = <TemplateView>page.getViewById("template-view");
    TKUnit.assert(templateView, "Expected the page to have a TemplateView with 'temaplte-view' id.");
    templateView.parseTemplate();
    TKUnit.assertEqual(templateView.getChildrenCount(), 1, "Expected TemplateView initially to have 1 child.");
    var childTemplateView = <TemplateView>templateView.getChildAt(0);
    TKUnit.assert(childTemplateView, "Expected the TemplateView's template to create a child TemplateView.");
    childTemplateView.notify({
        eventName: "test",
        object: childTemplateView
    });

    TKUnit.assert(notified, "Expected the child to raise the test event.");
}

export function test_tabview_selectedindex_will_work_from_xml() {
    var p = <Page>builder.parse(
        "<Page>" +
        "<TabView selectedIndex= \"1\">" +
        "<TabView.items>" +
        "<TabViewItem title=\"First\">" +
        "<TabViewItem.view>" +
        "<Label text=\"First View\" />" +
        "</TabViewItem.view>" +
        "</TabViewItem>" +
        "<TabViewItem title= \"Second\">" +
        "<TabViewItem.view>" +
        "<Label text=\"Second View\" />" +
        "</TabViewItem.view>" +
        "</TabViewItem>" +
        "</TabView.items>" +
        "</TabView>" +
        "</Page>");

    function testAction(views: Array<viewModule.View>) {
        let tab: TabView = <TabView>p.content;
        TKUnit.assertEqual(tab.selectedIndex, 1);
    };

    helper.navigate(function () { return p; });
    testAction([p.content, p]);
}

export function test_TabViewHasCorrectParentChain() {
    var testFunc = function (page: Page) {
        TKUnit.assert(page.bindingContext.get("testPassed"));
    }

    var model = new Observable();
    model.set("testPassed", false);
    helper.navigateToModuleAndRunTest("xml-declaration/mymodulewithxml/TabViewParentChain", model, testFunc);
}

export function test_hasSourceCodeLocations() {
    var basePath = "xml-declaration/";
    var page = <Page>builder.load(__dirname + "/examples/test-page.xml");
    var grid = page.getViewById("grid");
    var gridSource = Source.get(grid);
    TKUnit.assertEqual(gridSource.toString(), "file:///app/" + basePath + "examples/test-page.xml:2:3");
    var label = page.getViewById("label");
    var labelSource = Source.get(label);
    TKUnit.assertEqual(labelSource.toString(), "file:///app/" + basePath + "examples/test-page.xml:3:5");
}

export function test_Setting_digits_for_text_Label_is_not_converted_to_number() {
    var p = <Page>builder.parse("<Page><Label id=\"testLabel\" text=\"01234\"/></Page>");
    var testLabel = <Label>p.getViewById("testLabel");
    TKUnit.assertEqual(testLabel.text, "01234");
}

export function test_Setting_digits_for_text_Button_is_not_converted_to_number() {
    var p = <Page>builder.parse("<Page><Button id=\"testButton\" text=\"01234\"/></Page>");
    var testButton = <Button>p.getViewById("testButton");
    TKUnit.assertEqual(testButton.text, "01234");
}
