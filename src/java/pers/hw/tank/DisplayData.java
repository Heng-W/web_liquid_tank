package pers.hw.tank;

import java.io.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.ValueAxis;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.plot.XYPlot;
import org.jfree.data.xy.XYSeries;
import org.jfree.data.xy.XYSeriesCollection;

/**
 *
 * @author HW
 */
public class DisplayData {

    private final String title, xaxisName, yaxisName;
    private final String[] chartContent;
    private final String path;

    public DisplayData(String path, String title, String xaxisName, String yaxisName, String... chartContent) {
        this.path = path;
        this.title = title;
        this.xaxisName = xaxisName;
        this.yaxisName = yaxisName;
        this.chartContent = chartContent;
    }

    private JFreeChart createStaticChart(int ymin, int ymax) {
        XYSeries[] series = new XYSeries[chartContent.length];
        for (int i = 0; i < chartContent.length; i++) {
            series[i] = new XYSeries(chartContent[i]);
        }
        XYSeriesCollection dataset = new XYSeriesCollection();
        for (int i = 0; i < series.length; i++) {
            dataset.addSeries(series[i]);
        }
        File f = new File(path + "data.txt");
        if (f.exists()) {
            try {
                RandomAccessFile rf = new RandomAccessFile(path + "data.txt", "r");
                long seekPos = rf.getFilePointer() + rf.length() - 1;
                rf.seek(seekPos);
                while (rf.read() != '#') {
                    rf.seek(--seekPos);
                }
                rf.readLine();

                int cnt = 0;
                String buf;
                String[] data;
                while ((buf = rf.readLine()) != null) {
                    data = buf.split("\\s+");//以空格分割字符串
                    for (int i = 0; i < 3; i++) {
                        series[i].add(5 * cnt, Float.parseFloat(data[2 * i + 1]));
                    }
                    cnt++;
                }
                rf.close();
            } catch (IOException ex) {
                Logger.getLogger(DisplayData.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        JFreeChart chart = ChartFactory.createXYLineChart(title, xaxisName, yaxisName, dataset, PlotOrientation.VERTICAL, true, true, false);
        XYPlot xyplot = chart.getXYPlot();
        ValueAxis valueaxis = xyplot.getRangeAxis(0);
        valueaxis.setRange(ymin, ymax); //纵坐标设定   
        return chart;
    }

    public ChartPanel createChartPanel(int ymin, int ymax) {
        return new ChartPanel(createStaticChart(ymin, ymax));

    }

}
